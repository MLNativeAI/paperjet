// lib/context.ts
import { AsyncLocalStorage } from "async_hooks";
import type { IdReference } from "./types";

const contextStorage = new AsyncLocalStorage<IdReference>();

export class ExecutionContext {
  static run<T>(idReference: IdReference, fn: () => Promise<T>): Promise<T> {
    return contextStorage.run(idReference, fn);
  }

  static get(): IdReference | undefined {
    return contextStorage.getStore();
  }

  static getOrThrow(): IdReference {
    const context = contextStorage.getStore();
    if (!context) {
      throw new Error("No execution context available");
    }
    return context;
  }
}
