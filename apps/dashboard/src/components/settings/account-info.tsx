import { authClient } from "@/lib/auth-client";

export default function AccountInfo() {
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const { email, name } = session.user;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Account Information</h2>
      </div>
      <div className="grid gap-4">
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Name</span>
          <span className="text-base">{name || "Not set"}</span>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-muted-foreground">Email</span>
          <span className="text-base">{email}</span>
        </div>
      </div>
    </div>
  );
}
