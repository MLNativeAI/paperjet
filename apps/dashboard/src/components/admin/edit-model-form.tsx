import type { DbModelConfiguration } from "@paperjet/db/types";
import AddModelForm from "./add-model-form";

export default function EditModelForm({
  model,
  setDialogOpen,
}: {
  model: DbModelConfiguration;
  setDialogOpen: (open: boolean) => void;
}) {
  return <AddModelForm model={model} setDialogOpen={setDialogOpen} />;
}
