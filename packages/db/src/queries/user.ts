import { eq } from "drizzle-orm";
import { db } from "../db";
import { invitation, user } from "../schema";

export async function getUserById({ userId }: { userId: string }) {
  const userData = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });
  return userData;
}

export async function getUserByEmail({ email }: { email: string }) {
  const userData = await db.query.user.findFirst({
    where: eq(user.email, email),
  });
  return userData;
}
export async function getUserInvitations({ invitationId }: { invitationId: string }) {
  const invitationResponse = await db.query.invitation.findFirst({
    where: eq(invitation.id, invitationId),
  });
  return invitationResponse;
}

export async function updateLastActiveOrgId({ organizationId, userId }: { organizationId: string; userId: string }) {
  await db
    .update(user)
    .set({
      lastActiveOrgId: organizationId,
    })
    .where(eq(user.id, userId));
}
