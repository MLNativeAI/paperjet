import { db } from "@paperjet/db";
import { file } from "@paperjet/db/schema";
import { type FileDataWithPresignedUrl, uploadFileSchema } from "@paperjet/db/types";
import { eq, inArray } from "drizzle-orm";

export interface FileServiceDeps {
    s3: {
        presign: (filename: string) => Promise<string>;
        file: (filename: string) => {
            write: (data: ArrayBuffer) => Promise<void>;
        };
    };
}

export class FileService {
    constructor(private deps: FileServiceDeps) {}

    async getFiles(userId: string): Promise<FileDataWithPresignedUrl[]> {
        const files = await db.select().from(file).where(eq(file.ownerId, userId));

        const filesWithPresignedUrl: FileDataWithPresignedUrl[] = await Promise.all(
            files.map(async (file) => {
                const presignedUrl = await this.deps.s3.presign(`${file.filename}`);
                return {
                    ...file,
                    presignedUrl,
                };
            }),
        );

        return filesWithPresignedUrl;
    }

    async uploadFile(userId: string, fileParam: File, name: string): Promise<{ id: string }> {
        if (!fileParam || !name) {
            throw new Error("File and name are required");
        }

        const validatedData = uploadFileSchema.parse({
            file: fileParam,
            name: name,
        });

        const id = crypto.randomUUID();

        await db.insert(file).values({
            id,
            filename: validatedData.name,
            createdAt: new Date(),
            ownerId: userId,
        });

        const fileBuffer = await fileParam.arrayBuffer();

        await this.deps.s3.file(`${validatedData.name}`).write(fileBuffer);

        return { id };
    }

    async deleteFiles(fileIds: string[]): Promise<void> {
        if (!fileIds || fileIds.length === 0) {
            throw new Error("File IDs are required");
        }

        console.log("Deleting files:", fileIds);
        await db.delete(file).where(inArray(file.id, fileIds));
    }
}
