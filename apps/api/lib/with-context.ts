import { ExecutionContext } from "@paperjet/shared";
import type { Context } from "hono";
import { getUser } from "./auth";

export const withContext = async <T>(c: Context, next: () => Promise<T>): Promise<T> => {
  const user = await getUser(c);
  const workflowId = c.req.param("workflowId");
  const executionId = c.req.param("executionId");
  const env = Bun.env.ENVIRONMENT;

  return await ExecutionContext.run({ userId: user.id, workflowId, executionId, env }, () => next());
};
