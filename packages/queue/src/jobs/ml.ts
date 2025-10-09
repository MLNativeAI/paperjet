import { runNativeOcrOnDocument, splitPdfIntoImages } from "@paperjet/engine";
import { logger } from "@paperjet/shared";
import { type Job, Queue, Worker } from "bullmq";
import z from "zod";
import { redisConnection } from "../redis";
import { QUEUE_NAMES } from "../types";

export const mlServiceQueue = new Queue(QUEUE_NAMES.ML_JOB, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
  },
});

const mlServiceJobSchema = z.object({
  workflowId: z.string(),
  workflowExecutionId: z.string(),
  operation: z.enum(["split", "ocr"]),
  modelType: z.enum(["fast", "accurate"]),
});

export type MLServiceJobData = z.infer<typeof mlServiceJobSchema>;

export const mlWorker = new Worker(
  QUEUE_NAMES.ML_JOB,
  async (job: Job<MLServiceJobData>) => {
    logger.info(job.data, "ML worker entrypoint");
    switch (job.data.operation) {
      case "split": {
        logger.info("Starting PDF split job");
        await splitPdfIntoImages(job.data.workflowExecutionId);
        logger.info("PDF split job completed");
        return true;
      }
      case "ocr": {
        logger.info("Starting OCR job");
        await runNativeOcrOnDocument(job.data.workflowExecutionId);
        logger.info("OCR job completed");
        return true;
      }
      default:
        logger.error(`Invalid ML operation: ${job.data.operation}`);
        throw new Error("ML Job failed");
    }
  },
  {
    connection: redisConnection,
    concurrency: 1,
    name: "ml-worker",
  },
);
