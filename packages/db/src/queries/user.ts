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

export async function updateUserOnboarding({ userId }: { userId: string }) {
  const updatedUser = await db
    .update(user)
    .set({ onboardingCompleted: true, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning();

  return updatedUser[0];
}
