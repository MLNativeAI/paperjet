import type { WorkflowConfiguration } from "@paperjet/db/types";
import { extractDataFromImage, extractDataFromMarkdown } from "@paperjet/engine";
import { type Job, Queue, Worker } from "bullmq";
import { redisConnection } from "../redis";
import { QUEUE_NAMES } from "../types";
import type { WorkflowExtractionData } from "../workflows/extraction";

export const extractionQueue = new Queue(QUEUE_NAMES.EXTRACTION_JOB, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 2, // Expensive AI operations, limited retries
    backoff: {
      type: "exponential" as const,
      delay: 2000,
    },
  },
});

export const extractWorker = new Worker(
  QUEUE_NAMES.EXTRACTION_JOB,
  async (job: Job<WorkflowExtractionData>) => {
    const { workflowId, workflowExecutionId, configuration, modelType, inputType } = job.data;
    switch (inputType) {
      case "document": {
        const result = await extractDataFromMarkdown(
          workflowId,
          workflowExecutionId,
          configuration as WorkflowConfiguration,
          modelType,
        );
        return { success: true, extractedData: result };
      }
      case "image": {
        const result = await extractDataFromImage(
          workflowId,
          workflowExecutionId,
          configuration as WorkflowConfiguration,
        );
        return { success: true, extractedData: result };
      }
      default: {
        throw new Error("Unsupported inputType");
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
    name: "extract-worker",
  },
);
