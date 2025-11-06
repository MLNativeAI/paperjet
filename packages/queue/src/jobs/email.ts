import { sendFeedbackEmail } from "@paperjet/engine";
import { logger } from "@paperjet/shared";
import { type Job, Queue, Worker } from "bullmq";
import { redisConnection } from "../redis";
import { QUEUE_NAMES } from "../types";

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
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

export type EmailType = "feedback";
export type EmailData = {
  email: string;
  emailType: EmailType;
};

export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job: Job<EmailData>) => {
    logger.info(job.data, "Handling email job");
    const { email, emailType } = job.data;
    switch (emailType) {
      case "feedback":
        await sendFeedbackEmail(email);
    }
  },
  {
    connection: redisConnection,
    concurrency: 10,
    name: "extract-worker",
  },
);
