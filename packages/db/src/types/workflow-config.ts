import z from "zod";

const FieldSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.union([z.literal("string"), z.literal("date"), z.literal("number")]),
});

const ColumnSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  type: z.union([z.literal("string"), z.literal("date"), z.literal("number")]),
});

const TableSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(ColumnSchema),
});

const FieldsObjectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  fields: z.optional(z.array(FieldSchema)),
  tables: z.optional(z.array(TableSchema)),
});

export const WorkflowConfigurationSchema = z.object({
  objects: z.array(FieldsObjectSchema),
});

export type WorkflowConfiguration = z.infer<typeof WorkflowConfigurationSchema>;

export type WorkflowInputType = "image" | "document";
