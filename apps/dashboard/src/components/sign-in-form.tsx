import { Link, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import MagicLinkForm from "./forms/magic-link-form";
import { SocialForm } from "./forms/social-form";
import { EmailPasswordForm } from "./forms/email-password-form";

export function SignInForm({ className, ...props }: React.ComponentProps<"div">) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { authMode } = useRouteContext({ from: '/auth/sign-in' })

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
              setError={setError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            {authMode === 'magic-link' && <MagicLinkForm
              magicLinkSent={magicLinkSent}
              setMagicLinkSent={setMagicLinkSent}
              setError={setError}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />}
            {authMode === 'password' &&
              <EmailPasswordForm
                setError={setError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            }

            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>

          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link from="/auth/sign-in" to="/auth/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
