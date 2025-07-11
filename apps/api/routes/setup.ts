import { db } from "@paperjet/db";
import * as schema from "@paperjet/db/schema";
import { generateId, ID_PREFIXES } from "@paperjet/engine";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "../lib/auth";
import { sql } from "drizzle-orm";
import { logger } from "@paperjet/shared";
import { HTTPException } from "hono/http-exception";

const setupRouter = new Hono();

// Rate limiting: Track setup attempts
const setupAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_SETUP_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): void {
  const now = Date.now();
  const attempt = setupAttempts.get(ip);

  if (attempt) {
    // Clean up old entries
    if (now - attempt.firstAttempt > RATE_LIMIT_WINDOW) {
      setupAttempts.delete(ip);
    } else if (attempt.count >= MAX_SETUP_ATTEMPTS) {
      throw new HTTPException(429, { message: "Too many setup attempts. Please try again later." });
    }
  }
}

function recordSetupAttempt(ip: string): void {
  const now = Date.now();
  const attempt = setupAttempts.get(ip);

  if (attempt) {
    attempt.count++;
  } else {
    setupAttempts.set(ip, { count: 1, firstAttempt: now });
  }
}

// Check if setup is needed (no admin exists)
setupRouter.get("/status", async (c) => {
  try {
    // Check if any admin user exists
    const adminCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(sql`${schema.user.role} = 'admin'`);

    const needsSetup = adminCount[0]?.count === 0;

    logger.info({ needsSetup }, "Setup status check");

    return c.json({ needsSetup });
  } catch (error) {
    logger.error({ error }, "Failed to check setup status");
    return c.json({ error: "Failed to check setup status" }, 500);
  }
});

// Create first admin account
const createAdminSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(100).optional(),
  name: z.string().min(1).max(100),
});

setupRouter.post("/create-admin", zValidator("json", createAdminSchema), async (c) => {
  const clientIp = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

  try {
    // Check rate limit
    checkRateLimit(clientIp);
    recordSetupAttempt(clientIp);
    // Check if any admin already exists (prevent multiple admins via this endpoint)
    const adminCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.user)
      .where(sql`${schema.user.role} = 'admin'`);

    if (adminCount[0]?.count && adminCount[0]?.count > 0) {
      return c.json({ error: "Admin already exists" }, 403);
    }

    const { email, password, name } = c.req.valid("json");

    logger.info({ email, name }, "Creating first admin account");

    // Use Better Auth to create the user
    if (password) {
      // Create user with email/password
      const result = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: c.req.raw.headers,
      });

      if (!result.user) {
        throw new Error("Failed to create user");
      }

      // Update the user role to admin
      await db
        .update(schema.user)
        .set({ role: "admin" })
        .where(sql`${schema.user.id} = ${result.user.id}`);

      logger.info({
        userId: result.user.id,
        email,
        ip: clientIp,
        timestamp: new Date().toISOString(),
        event: "FIRST_ADMIN_CREATED"
      }, "Admin account created successfully");

      return c.json({
        success: true,
        user: { ...result.user, role: "admin" },
        session: result.token
      });
    } else {
      // Create user and send magic link
      const userId = generateId(ID_PREFIXES.user);

      // First create the user directly
      await db.insert(schema.user).values({
        id: userId,
        email,
        name,
        role: "admin",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Send magic link
      await auth.api.sendMagicLinkEmail({
        body: { email },
        headers: c.req.raw.headers,
      });

      logger.info({
        userId,
        email,
        ip: clientIp,
        timestamp: new Date().toISOString(),
        event: "FIRST_ADMIN_CREATED_MAGIC_LINK"
      }, "Admin account created, magic link sent");

      return c.json({
        success: true,
        magicLinkSent: true,
        message: "Admin account created. Check your email for the magic link to sign in."
      });
    }
  } catch (error) {
    if (error instanceof HTTPException && error.status === 429) {
      return c.json({ error: error.message }, 429);
    }
    logger.error({ error, ip: clientIp }, "Failed to create admin account");
    return c.json({ error: "Failed to create admin account" }, 500);
  }
});

export default setupRouter;