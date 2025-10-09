import { Button } from "@/components/ui/button";
import { useUserInvitations } from "@/hooks/use-user-invitations";
import { renderTimestamp } from "@/lib/utils/date";

export default function UserInvitations() {
  const { invitations, isLoading, acceptInvitation, rejectInvitation } = useUserInvitations();

  if (isLoading || !invitations || invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">My invitations</h2>
        <p className="text-muted-foreground">Review and accept your invitations</p>
      </div>
      <div className="flex flex-col gap-4">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex justify-between">
            <div className="text-md">
              <div className="font">
                You are invited to the <span className="font-semibold">{invitation.organizationName}</span> Organization
              </div>
              <div className="text-sm text-muted-foreground">
                This invitation expires in {renderTimestamp(new Date(invitation.expiresAt))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => rejectInvitation(invitation.id, invitation.organizationName)}>
                Reject
              </Button>
              <Button onClick={() => acceptInvitation(invitation.id, invitation.organizationName)}>Accept</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
