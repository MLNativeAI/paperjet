export type IdReference = {
  userId?: string;
  workflowId?: string;
  executionId?: string;
  env?: string;
};

export type AuthContext = {
  userId: string;
  organizationId: string;
  activePlan: "free" | "basic" | "pro";
  scope: "user" | "superadmin";
};

export const MODEL_PROVIDERS = [
  "anthropic",
  "azure",
  "google",
  "groq",
  "lmstudio",
  "mistral",
  "ollama",
  "openai",
  "openrouter",
  "vllm",
  "custom",
] as const;

export type ModelProvider = (typeof MODEL_PROVIDERS)[number];

export type ModelProviderEntry = {
  id: ModelProvider;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};
