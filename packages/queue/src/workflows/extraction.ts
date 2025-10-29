import { incrementUsage } from "@paperjet/billing";
import { getDocumentPagesByWorkflowExecutionId, updateDocumentMarkdown, updateExecutionStatus } from "@paperjet/db";
import { type WorkflowConfiguration, WorkflowExecutionStatus } from "@paperjet/db/types";
import { logger } from "@paperjet/shared";
import type { AuthContext } from "@paperjet/shared/types";
import { type Job, Queue, WaitingChildrenError, Worker } from "bullmq";
import z from "zod";
import { extractionQueue } from "../jobs/extraction";
import { markdownQueue } from "../jobs/markdown";
import { mlServiceQueue } from "../jobs/ml";
import { redisConnection } from "../redis";
import { QUEUE_NAMES } from "../types";

export const workflowExecutionQueue = new Queue(QUEUE_NAMES.EXTRACTION_WORKFLOW, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 1, // Workflow orchestration, child failures handled explicitly
    backoff: {
      type: "exponential" as const,
      delay: 2000,
    },
  },
});

const workflowSteps = z.enum([
  "INIT",
  "WAITING_FOR_SPLIT",
  "WAITING_FOR_IMAGE",
  "MARKDOWN",
  "WAITING_FOR_MARKDOWN",
  "EXTRACTION",
  "WAITING_FOR_EXTRACTION",
  "FINISHED",
]);

export type WorkflowExtractionData = {
  workflowId: string;
  workflowExecutionId: string;
  configuration: WorkflowConfiguration;
  authContext: AuthContext;
  inputType: "image" | "document";
  step?: z.infer<typeof workflowSteps>;
};
export const extractionWorkflowWorker = new Worker(
  QUEUE_NAMES.EXTRACTION_WORKFLOW,
  async (job: Job<WorkflowExtractionData>, token?: string) => {
    const { inputType } = job.data;
    let step = job.data.step || workflowSteps.enum.INIT;
    while (step !== workflowSteps.enum.FINISHED) {
      switch (step) {
        case workflowSteps.enum.INIT: {
          switch (inputType) {
            case "image": {
              // handle image flow
              await updateExecutionStatus({
                workflowExecutionId: job.data.workflowExecutionId,
                status: WorkflowExecutionStatus.enum.Processing,
                isCompleted: false,
              });
              logger.info("Processing image workflow");
              await job.updateData({ ...job.data, step: workflowSteps.enum.EXTRACTION });
              step = workflowSteps.enum.EXTRACTION;
              break;
            }
            case "document": {
              await addDocumentSplitJob(job);
              await job.updateData({ ...job.data, step: workflowSteps.enum.WAITING_FOR_SPLIT });
              step = workflowSteps.enum.WAITING_FOR_SPLIT;
              break;
            }
          }
          break;
        }
        case workflowSteps.enum.WAITING_FOR_SPLIT: {
          await checkChildJobsCompletedSuccessfully(job, workflowSteps.enum.WAITING_FOR_SPLIT, token);
          await job.updateData({ ...job.data, step: workflowSteps.enum.MARKDOWN });
          step = workflowSteps.enum.MARKDOWN;
          break;
        }
        case workflowSteps.enum.MARKDOWN: {
          await addMarkdownJobs(job);
          await job.updateData({ ...job.data, step: workflowSteps.enum.WAITING_FOR_MARKDOWN });
          step = workflowSteps.enum.WAITING_FOR_MARKDOWN;
          break;
        }
        case workflowSteps.enum.WAITING_FOR_MARKDOWN: {
          await checkChildJobsCompletedSuccessfully(job, workflowSteps.enum.WAITING_FOR_MARKDOWN, token);
          await assembleFullDocument(job);
          await job.updateData({ ...job.data, step: workflowSteps.enum.EXTRACTION });
          step = workflowSteps.enum.EXTRACTION;
          break;
        }
        case workflowSteps.enum.EXTRACTION: {
          await addExtractionJob(job);
          await job.updateData({ ...job.data, step: workflowSteps.enum.WAITING_FOR_EXTRACTION });
          step = workflowSteps.enum.WAITING_FOR_EXTRACTION;
          break;
        }
        case workflowSteps.enum.WAITING_FOR_EXTRACTION: {
          await checkChildJobsCompletedSuccessfully(job, workflowSteps.enum.WAITING_FOR_EXTRACTION, token);
          await finalizeWorkflow(job);
          await job.updateData({ ...job.data, step: workflowSteps.enum.FINISHED });
          step = workflowSteps.enum.FINISHED;
          break;
        }
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    name: "extraction-workflow-worker",
  },
);

extractionWorkflowWorker.on("failed", async (job, _) => {
  if (job?.data.workflowExecutionId) {
    logger.error(`parent job ${job?.data.workflowExecutionId} failed`);
    await updateExecutionStatus({
      workflowExecutionId: job.data.workflowExecutionId,
      status: WorkflowExecutionStatus.enum.Failed,
      isCompleted: true,
    });
  }
});

async function addDocumentSplitJob(job: Job<WorkflowExtractionData>) {
  const { workflowExecutionId } = job.data;
  await updateExecutionStatus({
    workflowExecutionId: job.data.workflowExecutionId,
    status: WorkflowExecutionStatus.enum.Processing,
    isCompleted: false,
  });

  if (!job.id) {
    throw new Error("Fatal error, job ID missing");
  }

  await mlServiceQueue.add(
    workflowExecutionId,
    {
      ...job.data,
      operation: "split",
    },
    {
      parent: {
        id: job.id,
        queue: job.queueQualifiedName,
      },
      failParentOnFailure: true,
    },
  );
}

async function addMarkdownJobs(job: Job<WorkflowExtractionData>) {
  if (!job.id) {
    logger.error("Fatal error, job ID missing");
    throw new Error("Fatal error, job ID missing");
  }
  const { workflowExecutionId } = job.data;
  const pageData = await getDocumentPagesByWorkflowExecutionId({ workflowExecutionId });
  const bulkJobData = pageData.map((pageEntry) => {
    if (!job.id) {
      logger.error("Fatal error, job ID missing");
      throw new Error("Fatal error, job ID missing");
    }
    return {
      name: `${workflowExecutionId}-page-${pageEntry.pageNumber}`,
      data: {
        workflowExecutionId: workflowExecutionId,
        documentPageId: pageEntry.id,
      },
      opts: {
        parent: {
          id: job.id,
          queue: job.queueQualifiedName,
        },
        failParentOnFailure: true,
      },
    };
  });
  await markdownQueue.addBulk(bulkJobData);
  logger.debug(`Added ${bulkJobData.length} markdown jobs`);
}

async function addExtractionJob(job: Job<WorkflowExtractionData>) {
  if (!job.id) {
    throw new Error("Fatal error, job ID missing");
  }

  const { workflowExecutionId } = job.data;
  await extractionQueue.add(workflowExecutionId, job.data, {
    parent: {
      id: job.id,
      queue: job.queueQualifiedName,
    },
    failParentOnFailure: true,
  });
}

async function finalizeWorkflow(job: Job<WorkflowExtractionData>) {
  logger.info("Workflow execution completed");
  await incrementUsage(job.data.authContext.userId, job.data.authContext.organizationId);
  await updateExecutionStatus({
    workflowExecutionId: job.data.workflowExecutionId,
    status: WorkflowExecutionStatus.enum.Completed,
    isCompleted: true,
  });
}

async function checkChildJobsCompletedSuccessfully(job: Job<WorkflowExtractionData>, jobName: string, token?: string) {
  if (!token) {
    logger.error("Invalid token");
    throw new Error("Invalid token");
  }

  logger.info("Waiting");

  const shouldWait = await job.moveToWaitingChildren(token);

  if (shouldWait) {
    // Children are still processing, throw error to pause this job
    logger.info(`Waiting for ${jobName} children to complete`);
    throw new WaitingChildrenError();
  }

  logger.info(`All ${jobName} children completed successfully`);
}

async function assembleFullDocument(job: Job<WorkflowExtractionData>) {
  logger.info("Assembling full markdown document");
  const allPageData = await getDocumentPagesByWorkflowExecutionId({
    workflowExecutionId: job.data.workflowExecutionId,
  });

  // Debug logging
  logger.debug(
    {
      pageCount: allPageData.length,
      pages: allPageData.map((p) => ({
        pageNumber: p.pageNumber,
        hasMarkdown: !!p.rawMarkdown,
        markdownLength: p.rawMarkdown?.length || 0,
      })),
    },
    "Page data before assembling",
  );

  // Filter out null/undefined values and join with proper page breaks
  const fullMarkdownDocument = allPageData
    .map((pageData) => pageData.rawMarkdown)
    .filter((markdown) => markdown != null && markdown.trim() !== "")
    .join("\n\n---\n\n"); // Add page separator for clarity

  await updateDocumentMarkdown({
    rawMarkdown: fullMarkdownDocument,
    workflowExecutionId: job.data.workflowExecutionId,
  });

  logger.info(
    {
      totalLength: fullMarkdownDocument.length,
      pageCount: allPageData.length,
    },
    `Updated document with ${allPageData.length} pages of markdown content`,
  );
}
