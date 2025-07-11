// lib/context.ts
import { AsyncLocalStorage } from "async_hooks";
import type { IdReference } from "./types";

const contextStorage = new AsyncLocalStorage<IdReference>();

export function runExecutionContext<T>(idReference: IdReference, fn: () => Promise<T>): Promise<T> {
  return contextStorage.run(idReference, fn);
}

export function getExecutionContext(): IdReference | undefined {
  return contextStorage.getStore();
}

export function getOrThrowExecutionContext(): IdReference {
  const context = contextStorage.getStore();
  if (!context) {
    throw new Error("No execution context available");
  }
  return context;
}

export async function withExecutionContext<T>(
  {
    executionId,
    workflowId,
  }: {
    executionId?: string;
    workflowId?: string;
  },
  fn: () => Promise<T>,
): Promise<T> {
  const existingContext = getExecutionContext();
  return runExecutionContext(
    {
      ...existingContext,
      executionId,
      workflowId,
    },
    fn,
  );
}
