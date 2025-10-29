import { useRouteContext } from "@tanstack/react-router";
import type { Member } from "better-auth/plugins";
import InviteDialog from "@/components/settings/invite-dialog";
import { OrgMembersTable } from "@/components/settings/org-members-table";
import { useOrgMembers } from "@/hooks/use-org-members";

export default function OrgMembers({ member, isPro }: { member: Member | undefined; isPro: boolean }) {
  const { orgMemberInvitations, isLoading } = useOrgMembers();
  const { serverInfo } = useRouteContext({ from: "__root__" });

  const isAdminOrOwner = member?.role === "admin" || member?.role === "owner";

  return (
    <div className="space-y-6">
      <div className={`flex justify-between items-center ${serverInfo.saasMode && !isPro ? "opacity-50" : ""}`}>
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">Manage who has access to your organization</p>
        </div>
        {member && isAdminOrOwner && (
          <div className={serverInfo.saasMode && !isPro ? "pointer-events-none" : ""}>
            <InviteDialog />
          </div>
        )}
      </div>
      <div className={`pt-4 ${!isPro ? "opacity-50" : ""}`}>
        {member?.role && (
          <OrgMembersTable
            data={orgMemberInvitations}
            userId={member.userId}
            isAdmin={isAdminOrOwner}
            isLoading={isLoading}
          />
        )}
      </div>
      {serverInfo.saasMode && !isPro && isAdminOrOwner && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">You must upgrade to the Pro plan to add more team members</p>
        </div>
      )}
    </div>
  );
}
