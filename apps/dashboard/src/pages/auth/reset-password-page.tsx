import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PasswordResetForm } from "@/components/forms/password-reset-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string>("");
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>We'll send you a link to set up a new password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <PasswordResetForm setError={setError} />
            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>

          <div className="mt-6 text-center text-sm">
            <Link from="/auth/reset-password" to="/auth/sign-in" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
