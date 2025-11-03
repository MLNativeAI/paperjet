import { PostHog } from "posthog-node";
import { envVars } from "./env";

const client = envVars.POSTHOG_API_KEY
  ? new PostHog(envVars.POSTHOG_API_KEY, {
      host: "https://eu.i.posthog.com",
    })
  : undefined;

export const PosthogEventType = {
  ExecutionComplete: "execution_complete",
  ExecutionFailure: "execution_failure",
};

export async function flushPosthog() {
  if (client) {
    await client.shutdown(); // On program exit, call shutdown to stop pending pollers and flush any remaining events
  }
}

export async function reportExecutionComplete({
  userId,
  workflowId,
  executionId,
}: {
  userId: string;
  workflowId: string;
  executionId: string;
}) {
  client?.capture({
    distinctId: userId,
    event: PosthogEventType.ExecutionComplete,
    properties: {
      workflowId,
      executionId,
    },
  });
}

export async function reportExecutionFailure({
  userId,
  workflowId,
  executionId,
}: {
  userId: string;
  workflowId: string;
  executionId: string;
}) {
  client?.capture({
    distinctId: userId,
    event: PosthogEventType.ExecutionFailure,
    properties: {
      workflowId,
      executionId,
    },
  });
}
