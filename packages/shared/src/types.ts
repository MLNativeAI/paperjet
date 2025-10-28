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
