import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateApiKey } from "@/hooks/use-api-keys";

interface CreateApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (key: string) => void;
}

export function CreateApiKeyDialog({ open, onOpenChange, onSuccess }: CreateApiKeyDialogProps) {
  const [name, setName] = useState("");
  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("");
    }
    onOpenChange(open);
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    createApiKey(name.trim(), {
      onSuccess: (data) => {
        setName("");
        onOpenChange(false);
        onSuccess(data.key);
      },
      onError: () => {
        toast.error("Failed to create API key");
      },
    });
  };

  const handleClose = () => {
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>Create a new API key to access the PaperJet API programmatically.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Key Name</Label>
            <Input
              id="name"
              placeholder="e.g., Production Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreate();
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Give your API key a descriptive name to help you identify it later.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
