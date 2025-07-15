import { getAuthMode } from "@/lib/env";
import { getUsageData, isSetupRequired } from "@paperjet/engine";
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
}).get('/usage-data', async (c) => {
  const usageData = await getUsageData()
  return c.json(usageData)
})

export default router
