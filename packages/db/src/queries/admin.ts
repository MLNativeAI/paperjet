import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../schema";

export async function doesAdminAccountExist() {
  const adminUsers = await db.select().from(user).where(eq(user.role, "superadmin"));
  if (adminUsers.length === 0) {
    return false;
  } else {
    return true;
  }
}
