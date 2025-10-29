import AccountInfo from "@/components/settings/account-info";
import DeleteAccountForm from "@/components/settings/delete-account-form";

export default function AccountPage() {
  return (
    <div className="w-full px-4 py-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground">Manage your account</p>
        </div>
      </div>
      <div className="space-y-17 pt-8">
        <AccountInfo />
        <DeleteAccountForm />
      </div>
    </div>
  );
}
