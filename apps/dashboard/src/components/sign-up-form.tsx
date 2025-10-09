import { Link, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { EmailPasswordForm } from "@/components/forms/email-password-form";
import MagicLinkForm from "@/components/forms/magic-link-form";
import { SocialForm } from "@/components/forms/social-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SignUpForm({ invitationId }: { invitationId?: string }) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { serverInfo } = useRouteContext({ from: "/auth/sign-up" });

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Choose your preferred sign-up method</CardDescription>
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
                formMode="sign-up"
                setError={setError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                invitationId={invitationId}
              />
            )}
            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link from="/auth/sign-up" to="/auth/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
