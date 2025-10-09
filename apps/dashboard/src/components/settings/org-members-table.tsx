import { IconDotsVertical, IconMail, IconTrash, IconUserMinus, IconUserX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatRelative } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isOrgInvitation, isOrgMember, type OrgMemberInvitation } from "@/hooks/use-org-members";
import { authClient } from "@/lib/auth-client";
import { capitalizeFirstLetter } from "@/lib/utils/string";

function InviteOrJoinDate({ invOrMember }: { invOrMember: OrgMemberInvitation }) {
  if (isOrgMember(invOrMember)) {
    const relativeTime = formatRelative(invOrMember.createdAt, new Date());
    return <div className="text-xs text-muted-foreground">Joined {relativeTime}</div>;
  } else {
    const relativeTime = formatRelative(invOrMember.issuedAt, new Date());
    return <div className="text-xs text-muted-foreground">Invited {relativeTime}</div>;
  }
}

function InvitationBadge({ invOrMember }: { invOrMember: OrgMemberInvitation }) {
  if (isOrgInvitation(invOrMember)) {
    if (invOrMember.status === "pending") {
      return (
        <Badge variant="outline" className="h-5 text-xs text-yellow-500">
          Pending
        </Badge>
      );
    }
  }
  return null;
}

export function OrgMembersTable({
  data,
  userId,
  isAdmin,
  isLoading,
}: {
  data: OrgMemberInvitation[];
  userId: string;
  isAdmin: boolean;
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleRemoveMember = async (memberEmail: string) => {
    try {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberEmail,
      });

      if (error) {
        toast.error("Failed to remove member");
        console.error(error);
      } else {
        toast.success(`Removed ${memberEmail} from organization`);
        // Invalidate the query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      }
    } catch (err) {
      toast.error("Failed to remove member");
      console.error(err);
    }
  };

  const handleCancelInvitation = async (invitationId: string, inviteeEmail: string) => {
    try {
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });

      if (error) {
        toast.error("Failed to cancel invitation");
        console.error(error);
      } else {
        toast.success(`Cancelled invitation for ${inviteeEmail}`);
        // Invalidate the query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      }
    } catch (err) {
      toast.error("Failed to cancel invitation");
      console.error(err);
    }
  };

  const handleResendInvitation = async (email: string, role: "member" | "admin" | "owner") => {
    try {
      const { error } = await authClient.organization.inviteMember({
        email,
        role,
        resend: true,
      });

      if (error) {
        toast.error("Failed to resend invitation");
        console.error(error);
      } else {
        toast.success(`Resent invitation to ${email}`);
      }
    } catch (err) {
      toast.error("Failed to resend invitation");
      console.error(err);
    }
  };

  const handleLeaveOrganization = async (organizationId: string) => {
    try {
      const { data } = await authClient.organization.list();
      if (data?.length === 1) {
        toast.error("You cannot leave your only organization");
      } else {
        const { error } = await authClient.organization.leave({
          organizationId: organizationId,
        });

        if (error) {
          toast.error("Failed to leave organization");
          console.error(error);
        } else {
          toast.success("You have left the organization");
          await authClient.signOut();
          await router.navigate({ to: "/", reloadDocument: true });
        }
      }
    } catch (err) {
      toast.error("Failed to leave organization");
      console.error(err);
    }
  };

  const columns: ColumnDef<OrgMemberInvitation>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold">{row.original.email}</div>
          <div className="flex gap-2 items-center">
            <InviteOrJoinDate invOrMember={row.original} />
            <InvitationBadge invOrMember={row.original} />
          </div>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge className="min-w-20" variant="outline">
          {capitalizeFirstLetter(row.original.role)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        // For members
        if (isOrgMember(row.original)) {
          const isCurrentUser = row.original.id === userId;
          const orgId = row.original.organizationId;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                    size="icon"
                  >
                    <IconDotsVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isCurrentUser ? (
                    <DropdownMenuItem onClick={() => handleLeaveOrganization(orgId)} className="text-destructive">
                      <IconUserMinus className="mr-2 h-4 w-4" />
                      Leave Organization
                    </DropdownMenuItem>
                  ) : (
                    isAdmin && (
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(row.original.id)}
                        className="text-destructive"
                      >
                        <IconUserX className="mr-2 h-4 w-4" />
                        Remove from Organization
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }

        // For invitations
        if (isOrgInvitation(row.original)) {
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                    size="icon"
                  >
                    <IconDotsVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleCancelInvitation(row.original.id, row.original.email)}>
                    <IconTrash className="mr-2 h-4 w-4" />
                    Cancel Invitation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleResendInvitation(row.original.email, row.original.role)}>
                    <IconMail className="mr-2 h-4 w-4" />
                    Resend Invitation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        }

        return null;
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Show skeleton rows when loading
              <>
                <TableRow key="skeleton-1" className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto"></div>
                  </TableCell>
                </TableRow>
                <TableRow key="skeleton-2" className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto"></div>
                  </TableCell>
                </TableRow>
                <TableRow key="skeleton-3" className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto"></div>
                  </TableCell>
                </TableRow>
              </>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
