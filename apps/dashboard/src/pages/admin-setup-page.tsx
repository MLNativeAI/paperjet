import { AdminSetupForm } from "@/components/forms/admin-setup-form";
import { LogoBanner } from "@/components/logo-banner";

export default function AdminSetupPage() {
  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8">
      <LogoBanner />
      <div className="w-full max-w-sm">
        <AdminSetupForm className="w-full" />
      </div>
    </div>
  );
}
