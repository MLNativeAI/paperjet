import type { EngineServiceDeps } from "@paperjet/engine";
import { S3Client } from "bun";

const bunS3Client = new S3Client({
  accessKeyId: Bun.env.S3_ACCESS_KEY,
  secretAccessKey: Bun.env.S3_SECRET_KEY,
  bucket: Bun.env.S3_BUCKET,
  endpoint: Bun.env.S3_ENDPOINT,
});

// Create an adapter that matches the EngineServiceDeps interface
export const s3: EngineServiceDeps["s3"] = {
  presign: async (filename: string): Promise<string> => {
    return bunS3Client.presign(filename);
  },
  file: (filename: string) => ({
    write: async (data: ArrayBuffer): Promise<void> => {
      await bunS3Client.file(filename).write(data);
    },
  }),
};
