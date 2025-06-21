import { createFileRoute } from "@tanstack/react-router";
import { FileTable } from "@/pages/FileTable";

export const Route = createFileRoute("/_app/")({
  component: FileTable,
});
