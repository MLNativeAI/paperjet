import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function PasswordResetForm({ setError }: { setError: (_: string) => void }) {
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/finish-password-reset`,
      });

      if (error) {
        setError(error.message || "An error occurred sending the password reset link");
        return;
      }

      setResetLinkSent(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (_err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {!resetLinkSent ? (
        <form onSubmit={handleSendResetLink}>
          <div className="flex flex-col gap-3">
            <div className="grid gap-2">
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset password
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-sm text-muted-foreground">
            Password reset link sent! Check your email and click the link to reset the password.
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setResetLinkSent(false);
              setError("");
            }}
          >
            Send another link
          </Button>
        </div>
      )}
    </div>
  );
}
