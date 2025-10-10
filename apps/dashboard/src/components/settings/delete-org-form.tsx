import { useNavigate } from "@tanstack/react-router";
import type { Member } from "better-auth/plugins";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useOrganization } from "@/hooks/use-organization";
import { authClient } from "@/lib/auth-client";

interface DeleteOrgFormProps {
  member: Member | undefined;
}

export default function DeleteOrgForm({ member }: DeleteOrgFormProps) {
  const _navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();
  const { setActiveOrganization } = useOrganization();
  const isOwner = member?.role === "owner";

  // Disable delete if user only has 1 organization
  const canDelete = organizations && organizations.length > 1;

  const handleDelete = async () => {
    if (!isOwner || !activeOrganization) {
      toast.error("Only organization owners can delete the organization");
      return;
    }

    if (!canDelete) {
      toast.error("Cannot delete the only organization. Create another organization first.");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.organization.delete({
        organizationId: activeOrganization.id,
      });

      if (error) {
        toast.error(error.message || "Failed to delete organization");
        return;
      }

      // Find the first remaining organization and switch to it
      const remainingOrgs = organizations?.filter((org) => org.id !== activeOrganization.id);
      if (remainingOrgs && remainingOrgs.length > 0) {
        await setActiveOrganization(remainingOrgs[0].id);
        toast.success("Organization deleted successfully. Switched to another organization.");
      } else {
        toast.success("Organization deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete organization");
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold ">Danger Zone</h2>
          <p className="text-muted-foreground">Permanently delete this organization and all associated data</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={!canDelete}>
              Delete Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the{" "}
                <strong>{activeOrganization?.name || "this"}</strong> organization and remove all associated data
                including workflows, executions, files, and team members.
                {canDelete && (
                  <span className="block mt-2 text-amber-600">
                    You will be automatically switched to another organization after deletion.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDelete} disabled={isLoading || !canDelete} variant="destructive">
                {isLoading ? "Deleting..." : "Delete Organization"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
