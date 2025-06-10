import { z } from "zod";
import { file } from "./schema";

export const uploadFileSchema = z.object({
    file: z.instanceof(File),
    name: z.string(),
})

export type FileData = typeof file.$inferSelect;

export type FileDataWithPresignedUrl = FileData & {
    presignedUrl: string;
}
