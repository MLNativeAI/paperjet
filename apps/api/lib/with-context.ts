import type { Context } from "hono";
import { getUser } from "./auth";
import { runExecutionContext } from "@paperjet/shared/src/context";

export const withContext = async <T>(c: Context, next: () => Promise<T>): Promise<T> => {
  const user = await getUser(c);
  const workflowId = c.req.param("workflowId");
  const executionId = c.req.param("executionId");
  const env = Bun.env.ENVIRONMENT;

  return await runExecutionContext({ userId: user.id, workflowId, executionId, env }, () => next());
};
