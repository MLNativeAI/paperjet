import { convertPageToMarkdown } from "@paperjet/engine";
import { type Job, Queue, Worker } from "bullmq";
import z from "zod";
import { redisConnection } from "../redis";
import { QUEUE_NAMES } from "../types";

export const markdownQueue = new Queue(QUEUE_NAMES.MARKDOWN_JOB, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3, // AI model calls can have transient failures
    backoff: {
      type: "exponential" as const,
      delay: 2000,
    },
  },
});

const markdownJobSchema = z.object({
  workflowExecutionId: z.string(),
  documentPageId: z.string(),
  modelType: z.enum(["fast", "accurate"]),
});

export type MarkdownJobData = z.infer<typeof markdownJobSchema>;

export const markdownWorker = new Worker(
  QUEUE_NAMES.MARKDOWN_JOB,
  async (job: Job<MarkdownJobData>) => {
    const { workflowExecutionId, documentPageId, modelType } = job.data;
    await convertPageToMarkdown(workflowExecutionId, documentPageId, modelType);
  },
  {
    connection: redisConnection,
    concurrency: 10,
    name: "markdown-worker",
  },
);
