import { zodResolver } from "@hookform/resolvers/zod";
import type { Member } from "better-auth/plugins";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const orgNameSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
});

type OrgNameFormValues = z.infer<typeof orgNameSchema>;

export default function OrgNameForm({ member }: { member: Member | undefined }) {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [editModeEnabled, setEditModeEnabled] = useState(false);

  const isAdminOrOwner = member?.role === "admin" || member?.role === "owner";

  const form = useForm<OrgNameFormValues>({
    resolver: zodResolver(orgNameSchema),
    defaultValues: {
      name: activeOrganization?.name || "",
    },
  });

  // Update form when activeOrganization loads
  React.useEffect(() => {
    if (activeOrganization?.name) {
      form.reset({ name: activeOrganization.name });
    }
  }, [activeOrganization?.name, form]);

  const onSubmit = async (values: OrgNameFormValues) => {
    if (!activeOrganization) {
      toast.error("No active organization found");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.organization.update({
        data: {
          name: values.name,
        },
        organizationId: activeOrganization.id,
      });

      if (error) {
        toast.error("Failed to update organization");
      } else {
        toast.success("Organization updated successfully");
        setEditModeEnabled(false);
      }
    } catch (err) {
      toast.error("Failed to update organization");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    form.reset({ name: activeOrganization?.name || "" });
    setEditModeEnabled(false);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Organization</h2>
        {isAdminOrOwner && (
          <Button variant="outline" disabled={editModeEnabled} onClick={() => setEditModeEnabled(true)}>
            Edit
          </Button>
        )}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={!editModeEnabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {editModeEnabled && (
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
