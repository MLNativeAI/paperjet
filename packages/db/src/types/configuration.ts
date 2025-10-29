import type { WorkflowInputType } from "./workflow-config";

export type RuntimeModelType = "fast" | "accurate";

export type RuntimeModel = {
  name: string;
  modelId: string;
};

export type RuntimeConfiguration = {
  fastModel: RuntimeModel | null;
  accurateModel: RuntimeModel | null;
};

export type ServerInfo = {
  adminAccountExists: boolean;
  saasMode: boolean;
  authMode: string;
};

export type ValidatedFile = { file: File; type: WorkflowInputType; mimeType: string };
