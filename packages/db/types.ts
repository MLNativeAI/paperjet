import { z } from "zod";
import type { file } from "./schema";

export const uploadFileSchema = z.object({
  file: z.instanceof(File),
  name: z.string(),
});

export type FileData = typeof file.$inferSelect;

export type FileDataWithPresignedUrl = FileData & {
  presignedUrl: string;
};
