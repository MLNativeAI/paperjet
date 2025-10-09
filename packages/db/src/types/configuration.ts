export type RuntimeModelType = "fast" | "accurate";

export interface RuntimeModel {
  name: string;
  modelId: string;
}

export interface RuntimeConfiguration {
  fastModel: RuntimeModel | null;
  accurateModel: RuntimeModel | null;
}
