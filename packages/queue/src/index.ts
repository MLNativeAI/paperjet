import { logger } from "@paperjet/shared";
import { extractWorker } from "./jobs/extraction";
import { markdownWorker } from "./jobs/markdown";
import { mlWorker } from "./jobs/ml";
import { extractionWorkflowWorker } from "./workflows/extraction";

export type { WorkflowExtractionData } from "./workflows/extraction";
export { workflowExecutionQueue } from "./workflows/extraction";
export const allWorkers = [extractionWorkflowWorker, markdownWorker, mlWorker, extractWorker];

allWorkers.forEach((worker) => {
  worker.on("completed", (job: any, result: any) => {
    logger.trace(
      {
        jobId: job.id,
        jobName: job.name,
        specId: job.data.specId,
        result,
      },
      "Worker job completed",
    );
  });
  worker.on("failed", (job: any, err: Error) => {
    logger.error({ error: err.message, jobName: job.jobName }, "Worker job failed");
  });
  worker.on("stalled", (jobId: any) => {
    logger.warn({ jobId }, "Worker job stalled");
  });
  worker.on("error", (err: Error) => {
    logger.error(err, "Worker error");
  });
});
