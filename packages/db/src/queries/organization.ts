import { randomUUID } from "node:crypto";
import { generateOrgSlug } from "@paperjet/shared/id";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { member, organization } from "../schema";
import type { DbOrganization } from "../types/tables";

export async function getUserOrganizations({ userId }: { userId: string }) {
  const userOrgs = await db.query.member.findMany({
    where: eq(member.userId, userId),
  });
  return userOrgs;
}

export async function createOrganization({ name }: { name: string }): Promise<DbOrganization> {
  const { slug, id: organizationId } = generateOrgSlug();
  const orgData = await db
    .insert(organization)
    .values({
      id: organizationId,
      slug: slug,
      name: name,
      createdAt: new Date(),
    })
    .returning();
  if (!orgData[0]) {
    throw new Error("Create org failed");
  }
  return orgData[0];
}

export async function createOrganizationMember({
  organizationId,
  role,
  userId,
}: {
  organizationId: string;
  role: "owner" | "member" | "admin";
  userId: string;
}) {
  await db.insert(member).values({
    id: randomUUID(),
    createdAt: new Date(),
    organizationId: organizationId,
    userId: userId,
    role: role,
  });
}

export async function getOrganizationsByIds({ organizationIds }: { organizationIds: string[] }) {
  const organizations = await db.query.organization.findMany({
    where: (organization, { inArray }) => inArray(organization.id, organizationIds),
  });
  return organizations;
}

export async function getOrganization({ organizationId }: { organizationId: string }) {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
  });
  return org;
}
