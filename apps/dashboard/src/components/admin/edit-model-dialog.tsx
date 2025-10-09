import type { DbModelConfiguration } from "@paperjet/db/types";
import { Pencil } from "lucide-react";
import { useState } from "react";
import AddEditModelForm from "@/components/admin/add-model-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditModelDialog({ model }: { model: DbModelConfiguration }) {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit model</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Model Configuration</DialogTitle>
          <DialogDescription>Update the AI model configuration.</DialogDescription>
        </DialogHeader>
        <AddEditModelForm model={model} setDialogOpen={setDialogOpen} />
      </DialogContent>
    </Dialog>
  );
}
