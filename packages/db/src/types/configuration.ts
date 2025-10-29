import type { WorkflowInputType } from "./workflow-config";

export type RuntimeModelType = "core" | "vision";

export type RuntimeModel = {
  name: string;
  modelId: string;
};

export type RuntimeConfiguration = {
  coreModel: RuntimeModel | null;
  visionModel: RuntimeModel | null;
};

export type ServerInfo = {
  adminAccountExists: boolean;
  saasMode: boolean;
  authMode: string;
};

export type ValidatedFile = { file: File; type: WorkflowInputType; mimeType: string };
