import { AdminSetupForm } from "@/components/forms/admin-setup-form";
import { LogoBanner } from "@/components/logo-banner";

export default function AdminSetupPage() {

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex items-center w-[500px] flex-col gap-6">
        <LogoBanner />
        <AdminSetupForm className="w-full" />
      </div>
    </div>
  )
}
