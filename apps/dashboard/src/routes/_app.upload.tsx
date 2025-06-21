import { createFileRoute } from "@tanstack/react-router";
import UploadFile from "@/pages/UploadFile";

export const Route = createFileRoute("/_app/upload")({
  component: UploadFile,
});
