import { AlertCircle, Copy, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface NewApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewApiKeyDialog({ open, onOpenChange, onSuccess }: NewApiKeyDialogProps) {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const { mutate: createApiKey, isPending: isCreating } = useCreateApiKey();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("");
      setNewKey(null);
      setIsCreated(false);
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
        setNewKey(data.key);
        setIsCreated(true);
        setName("");
      },
      onError: () => {
        toast.error("Failed to create API key");
      },
    });
  };

  const copyToClipboard = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Failed to copy API key");
    }
  };

  const handleClose = () => {
    setName("");
    onOpenChange(false);
  };

  const handleKeyDialogClose = () => {
    setNewKey(null);
    setIsCreated(false);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={isCreated ? "max-w-5xl" : ""}>
        <DialogHeader>
          {isCreated ? (
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              <DialogTitle>API Key Created Successfully</DialogTitle>
            </div>
          ) : (
            <>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>Create a new API key to access the PaperJet API programmatically.</DialogDescription>
            </>
          )}
        </DialogHeader>

        {isCreated ? (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Make sure to copy your API key now. You won't be able to see it again!
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your API Key</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono select-all break-all">{newKey}</code>
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        <DialogFooter>
          {isCreated ? (
            <Button onClick={handleKeyDialogClose}>I've Copied the Key</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Key"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
