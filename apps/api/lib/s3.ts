import { S3Client } from "bun";

export const s3 = new S3Client({
  accessKeyId: Bun.env.S3_ACCESS_KEY,
  secretAccessKey: Bun.env.S3_SECRET_KEY,
  bucket: Bun.env.S3_BUCKET,
  endpoint: Bun.env.S3_ENDPOINT,
});
