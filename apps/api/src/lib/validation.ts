import type { ValidatedFile } from "@paperjet/db/types";
import { envVars, logger } from "@paperjet/shared";
import type { AuthContext } from "@paperjet/shared/types";
import { countDocumentPages } from "document-page-counter";
import { z } from "zod";

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
  | { code: string; success: false; error: string };

export async function validateFile(file: File, authContext: AuthContext): Promise<FileValidationResponse> {
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Invalid file", code: "INVALID_FILE" };
  }
  if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
    return { success: false, error: "File must be a PDF or image", code: "INVALID_FILE_TYPE" };
  }
  if (envVars.SAAS_MODE && file.type === "application/pdf" && authContext.activePlan !== "pro") {
    try {
      const buffer = await file.arrayBuffer();
      const result = await countDocumentPages(buffer, file.type);
      if (result.pages > 20) {
        return {
          success: false,
          error: "PDFs with more than 20 pages require a pro plan",
          code: "PRO_PLAN_REQUIRED",
        };
      }
    } catch (error) {
      logger.error(error, "Failed to check PDF page count");
      return { success: false, error: "Failed to validate PDF", code: "FILE_VALIDATION_FAILED" };
    }
  }

  const type = file.type === "application/pdf" ? "document" : "image";
  return { success: true, file: { file, type, mimeType: file.type } };
}
