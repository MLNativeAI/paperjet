import { isSetupRequired } from "@paperjet/engine";
import { Hono } from "hono";

const app = new Hono();

const router = app.get('/', async (c) => {
  const isAdminSetupRequired = await isSetupRequired();
  return c.json({
    isSetupRequired: isAdminSetupRequired
  })
})

export default router
