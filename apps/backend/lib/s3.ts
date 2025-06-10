import { S3Client } from "bun";

export const s3 = new S3Client({
    accessKeyId: Bun.env.MINIO_ACCESS_KEY,
    secretAccessKey: Bun.env.MINIO_SECRET_KEY,
    bucket: Bun.env.MINIO_BUCKET,
    endpoint: Bun.env.MINIO_ENDPOINT,
});