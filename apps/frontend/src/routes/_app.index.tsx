import { FileTable } from "@/pages/FileTable";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: FileTable,
});
