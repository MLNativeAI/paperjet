import { handleOrganizationInvite, listUserInvitations } from "@paperjet/auth/invitations";
import { doesAdminAccountExist } from "@paperjet/db";
import { envVars, getAuthMode } from "@paperjet/shared";
import { Hono } from "hono";

const app = new Hono();

const router = app
  .get("/server-info", async (c) => {
    const adminAccountExists = await doesAdminAccountExist();
    const authMode = getAuthMode();
    return c.json({
      adminAccountExists: adminAccountExists,
      authMode: authMode,
    });
  })
  .get("/accept-invitation", async (c) => {
    return handleOrganizationInvite(c);
  })
  .get("/invitations", async (c) => {
    return listUserInvitations(c);
  })
  .get("/auth-callback", async (c) => {
    const query = c.req.query();
    const queryString = new URLSearchParams(query).toString();
    return c.redirect(`${envVars.BASE_URL}${queryString ? `?${queryString}` : ""}`);
  });
export { router as internalRouter };
export type InternalRoutes = typeof router;
