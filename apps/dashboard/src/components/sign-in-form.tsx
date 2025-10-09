import { Link, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EmailPasswordForm } from "./forms/email-password-form";
import MagicLinkForm from "./forms/magic-link-form";
import { SocialForm } from "./forms/social-form";

export function SignInForm({
  className,
  invitationId,
  ...props
}: React.ComponentProps<"div"> & { invitationId?: string }) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { serverInfo } = useRouteContext({ from: "/auth/sign-in" });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Choose your preferred sign-in method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <SocialForm
              invitationId={invitationId}
              setError={setError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            {serverInfo?.authMode === "magic-link" && (
              <MagicLinkForm
                magicLinkSent={magicLinkSent}
                setMagicLinkSent={setMagicLinkSent}
                setError={setError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                invitationId={invitationId}
              />
            )}
            {serverInfo?.authMode === "password" && (
              <EmailPasswordForm
                formMode="sign-in"
                setError={setError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                invitationId={invitationId}
              />
            )}

            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>

          <div className="flex flex-col mt-6 text-center text-sm gap-2">
            <div>
              Don&apos;t have an account?{" "}
              <Link from="/auth/sign-in" to="/auth/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
            {serverInfo?.authMode === "password" && (
              <Link from="/auth/sign-in" to="/auth/reset-password" className="underline underline-offset-4">
                Reset password
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
