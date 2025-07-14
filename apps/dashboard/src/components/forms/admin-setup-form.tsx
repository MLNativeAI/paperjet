
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmailPasswordForm } from "@/components/forms/email-password-form"
import { useState } from "react"

export function AdminSetupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to PaperJet!</CardTitle>
          <CardDescription>
            Let's start by creating an admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <EmailPasswordForm
              formMode="admin-sign-up"
              isLoading={isLoading}
              setError={setError}
              setIsLoading={setIsLoading}
            />
            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
