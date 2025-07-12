import { db } from "@paperjet/db"
import { adminSetup, user } from "@paperjet/db/schema"
import { eq } from "drizzle-orm"

export const isSetupRequired = async () => {
  const adminUsers = await db.select().from(user).where(eq(user.role, 'admin'));
  if (adminUsers.length == 0) {
    return true;
  } else {
    return false;
  }
}
