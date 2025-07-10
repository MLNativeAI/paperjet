import { boolean, integer, numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const file = pgTable("file", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  createdAt: timestamp("created_at").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
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

export const workflow = pgTable("workflow", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  description: text("description").notNull().default(""),
  categories: text("categories").notNull(), // JSON string
  configuration: text("configuration").notNull(), // JSON string
  status: text("status").notNull().default("draft"), // 'draft' | 'analyzing' | 'extracting' | 'configuring' | 'active' | 'error'
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fileId: text("file_id")
    .notNull()
    .references(() => file.id, { onDelete: "cascade" }),
  sampleData: text("sample_data").notNull(), // JSON string
  sampleDataExtractedAt: timestamp("sample_data_extracted_at"), // When sample data was last extracted
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const workflowExecution = pgTable("workflow_execution", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflow.id, { onDelete: "cascade" }),
  fileId: text("file_id")
    .notNull()
    .references(() => file.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // 'pending', 'processing', 'completed', 'failed'
  extractionResult: text("extraction_result"), // JSON result for the file
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});


export const modelPrice = pgTable("model_price", {
  id: text("id").primaryKey(),
  model: text("model").notNull(),
  price: numeric("price").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});


export const usageData = pgTable("usage_data", {
  id: text("id").primaryKey(),
  idReference: text("id_reference").notNull(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  inputCost: numeric("input_cost"),
  outputTokens: integer("output_tokens"),
  outputCost: numeric("output_cost"),
  totalTokens: integer("total_tokens"),
  totalCost: numeric("total_cost", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});