import { CircleX, Info } from "lucide-react";
import { SignInForm } from "@/components/sign-in-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Route } from "@/routes/auth/sign-in";

export default function SignInPage() {
  const { invitationId, notFound } = Route.useSearch();
  return (
    <div className="flex flex-col gap-4">
      {invitationId && (
        <Alert variant="default">
          <Info />
          <AlertTitle>Accept invitation</AlertTitle>
          <AlertDescription>Sign in to accept the organization invitation</AlertDescription>
        </Alert>
      )}
      {notFound && (
        <Alert variant="default">
          <CircleX />
          <AlertTitle>Invitation not found</AlertTitle>
          <AlertDescription>This invitation code does not exist</AlertDescription>
        </Alert>
      )}
      <SignInForm invitationId={invitationId} />
    </div>
  );
}
