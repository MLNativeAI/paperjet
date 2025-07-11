import { createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { SetupForm } from "@/components/setup-form";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
  beforeLoad: async () => {
    // Check if setup is needed
    const response = await api.setup.status.$get();
    const data = await response.json();
    
    if (!data.needsSetup) {
      // Setup already completed, redirect to sign in
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
});

function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to PaperJet</h1>
          <p className="text-muted-foreground">
            Let's get started by creating your admin account
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}