import { getProductMap } from "@paperjet/billing";
import { logger } from "@paperjet/shared";
import { Hono } from "hono";

const router = new Hono().get("/product-info", async (c) => {
  try {
    const products = await getProductMap();
    return c.json(products, 200);
  } catch (error) {
    logger.error(error, "Failed to fetch product info");
    return c.json({ error: "Iternal server error" }, 500);
  }
});

export { router as v1BillingRouter };

export type BillingRoutes = typeof router;
