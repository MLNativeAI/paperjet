import { Plus } from "lucide-react";
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

export function AddModelDialog() {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-5 w-5" />
          Add model
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Model Configuration</DialogTitle>
          <DialogDescription>Configure a new AI model for your organization.</DialogDescription>
        </DialogHeader>
        <AddEditModelForm setDialogOpen={setDialogOpen} />
      </DialogContent>
    </Dialog>
  );
}
