import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const workflowExecutionStatusEnum = pgEnum("workflowExecutionStatus", [
  "Queued",
  "Processing",
  "Completed",
  "Failed",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id").references(() => organization.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const file = pgTable("file", {
  id: text("id").primaryKey(),
  fileName: text("filename").notNull(),
  filePath: text("filepath").notNull(),
  mimeType: text("mime_type").notNull().default("application/pdf"),
  fileType: text("file_type").notNull().default("document"),
  createdAt: timestamp("created_at").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
});

export const workflow = pgTable("workflow", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  configuration: jsonb("configuration").notNull(),
  modelType: text("model_type").notNull().default("fast"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// represent the job execution of a given worklow. Does not store any result data
export const workflowExecution = pgTable("workflow_execution", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflow.id, { onDelete: "cascade" }),
  fileId: text("file_id")
    .notNull()
    .references(() => file.id, { onDelete: "cascade" }),
  jobId: text(),
  status: workflowExecutionStatusEnum("status").notNull().default("Queued"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const documentData = pgTable("document_data", {
  id: text("id").primaryKey(),
  rawMarkdown: text("raw_markdown"),
  extractedData: jsonb(),
  workflowId: text("workflow_id").references(() => workflow.id, { onDelete: "set null" }),
  workflowExecutionId: text("workflow_execution_id").references(() => workflowExecution.id, { onDelete: "set null" }),
  ownerId: text("owner_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documentPage = pgTable("document_page", {
  id: text("id").primaryKey(),
  documentDataId: text("document_data_id")
    .notNull()
    .references(() => documentData.id, { onDelete: "cascade" }),
  workflowExecutionId: text("workflow_execution_id").references(() => workflowExecution.id, { onDelete: "set null" }),
  pageNumber: integer("page_number").notNull(),
  rawMarkdown: text("raw_markdown"),
});
export const runtimeConfiguration = pgTable("runtime_configuration", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  accurateModelId: text("accurate_model_id").references(() => modelConfiguration.id),
  fastModelId: text("fast_model_id").references(() => modelConfiguration.id),
});

export const modelConfiguration = pgTable("model_configuration", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(),
  providerApiKey: text("provider_api_key"),
  modelName: text("model_name").notNull(),
  displayName: text("display_name").notNull(),
  baseUrl: text("base_url"),
});

export const apikey = pgTable("apikey", {
  id: text("id").primaryKey(),
  name: text("name"),
  start: text("start"),
  prefix: text("prefix"),
  key: text("key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id") // org id must be nullable if we want to use built-in better-auth api key handlers in @api-keys.ts
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  refillInterval: integer("refill_interval"),
  refillAmount: integer("refill_amount"),
  lastRefillAt: timestamp("last_refill_at"),
  enabled: boolean("enabled").default(true),
  rateLimitEnabled: boolean("rate_limit_enabled").default(true),
  rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
  rateLimitMax: integer("rate_limit_max").default(10000), // 10k requests per day
  requestCount: integer("request_count"),
  remaining: integer("remaining"),
  lastRequest: timestamp("last_request"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  permissions: text("permissions"),
  metadata: text("metadata"),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
  activePlan: text("active_plan").default("free").notNull(),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
