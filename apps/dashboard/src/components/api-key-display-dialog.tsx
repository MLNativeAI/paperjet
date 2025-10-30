import { AlertCircle, Copy, Key } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ApiKeyDisplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string | null;
}

export function ApiKeyDisplayDialog({ open, onOpenChange, apiKey }: ApiKeyDisplayDialogProps) {
  const copyToClipboard = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success("API key copied to clipboard");
    } catch {
      toast.error("Failed to copy API key");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-green-600" />
            <DialogTitle>API Key Created Successfully</DialogTitle>
          </div>
        </DialogHeader>

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
              <code className="flex-1 p-3 bg-muted rounded-md text-sm font-mono select-all break-all">{apiKey}</code>
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClose}>I've Copied the Key</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
