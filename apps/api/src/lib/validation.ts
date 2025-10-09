import type { ValidatedFile } from "@paperjet/db/types";
import { z } from "zod";

// Prefixed ID validation schemas
export const prefixedIdSchema = (prefix: string) =>
  z
    .string()
    .regex(
      new RegExp(`^${prefix}_[a-f0-9]{12}$`),
      `Must be a valid ${prefix}-prefixed ID (e.g., ${prefix}_abc123def456)`,
    );

export const workflowIdSchema = prefixedIdSchema("wkf");
export const fileIdSchema = prefixedIdSchema("fil");
export const workflowExecutionIdSchema = prefixedIdSchema("exe");
export const userIdSchema = prefixedIdSchema("usr");

// Flexible ID schema that accepts either UUID or prefixed format for backward compatibility
export const flexibleIdSchema = z.string().refine((val) => {
  // Check if it's a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Check if it's a prefixed ID
  const prefixedRegex = /^[a-z]{3}_[a-f0-9]{12}$/;
  return uuidRegex.test(val) || prefixedRegex.test(val);
}, "Must be a valid UUID or prefixed ID");

export type FileValidationResponse =
  | {
      success: true;
      file: ValidatedFile;
    }
  | { success: false; error: string };

export function validateFile(file: File): FileValidationResponse {
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Invalid file" };
  }
  if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
    return { success: false, error: "File must be a PDF or image" };
  }

  const type = file.type === "application/pdf" ? "document" : "image";
  return { success: true, file: { file, type, mimeType: file.type } };
}
