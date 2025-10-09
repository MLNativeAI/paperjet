import { envVars } from "@paperjet/shared";
import { S3Client } from "bun";

export const s3Client = new S3Client({
  accessKeyId: envVars.S3_ACCESS_KEY,
  secretAccessKey: envVars.S3_SECRET_KEY,
  bucket: envVars.S3_BUCKET,
  endpoint: envVars.S3_ENDPOINT,
});
