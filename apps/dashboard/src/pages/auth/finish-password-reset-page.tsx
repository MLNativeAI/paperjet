import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { FinishPasswordResetForm } from "@/components/forms/finish-password-reset-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function FinishPasswordResetPage() {
  const [error, setError] = useState<string>("");

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>Enter your new password below to finish resetting your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <FinishPasswordResetForm setError={setError} />
            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>

          <div className="mt-6 text-center text-sm">
            Remember your password?{" "}
            <Link from="/auth/finish-password-reset" to="/auth/sign-in" className="underline underline-offset-4">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
