import { CircleX, Info } from "lucide-react";
import { SignUpForm } from "@/components/sign-up-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Route } from "@/routes/auth/sign-up";

export default function SignUpPage() {
  const { invitationId, notFound } = Route.useSearch();
  return (
    <div className="flex flex-col gap-4">
      {invitationId && (
        <Alert variant="default">
          <Info />
          <AlertTitle>Create an account first</AlertTitle>
          <AlertDescription>You need to create an account to accept the invitation</AlertDescription>
        </Alert>
      )}
      {notFound && (
        <Alert variant="default">
          <CircleX />
          <AlertTitle>Invitation not found</AlertTitle>
          <AlertDescription>This invitation code does not exist</AlertDescription>
        </Alert>
      )}
      <SignUpForm invitationId={invitationId} />
    </div>
  );
}
