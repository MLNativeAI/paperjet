import DeleteOrgForm from "@/components/settings/delete-org-form";
import OrgMembers from "@/components/settings/org-members";
import OrgNameForm from "@/components/settings/org-name-form";
import UserInvitations from "@/components/settings/user-invitations";
import { useRole } from "@/hooks/use-role";

export default function OrganizationPage() {
  const { member } = useRole();
  return (
    <div className="space-y-17 pt-8">
      <UserInvitations />
      <OrgNameForm member={member} />
      <OrgMembers member={member} />
      <DeleteOrgForm member={member} />
    </div>
  );
}
