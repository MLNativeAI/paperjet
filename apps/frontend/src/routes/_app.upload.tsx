import UploadFile from "@/pages/UploadFile";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/upload")({
  component: UploadFile,
});
