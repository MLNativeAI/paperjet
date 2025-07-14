import { getAuthMode } from "@/lib/env";
import { isSetupRequired } from "@paperjet/engine";
import { Hono } from "hono";

const app = new Hono();

const router = app.get('/', async (c) => {
  const isAdminSetupRequired = await isSetupRequired();
  return c.json({
    isSetupRequired: isAdminSetupRequired
  })
}).get('/auth-mode', async (c) => {
  return c.json({
    authMode: getAuthMode()
  })
})

export default router
