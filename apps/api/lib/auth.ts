import { db } from "@paperjet/db";
import * as schema from "@paperjet/db/schema";
import { MagicLinkEmail, render } from "@paperjet/email";
import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { env } from "bun";
import { Resend } from "resend";

const publicRoutes = ["/api/health", "/api/auth/**"];

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        if (!resend) {
          console.log(`Magic link for ${email}: ${url}`);
          return;
        }

        try {
          const emailHtml = await render(MagicLinkEmail({ email, url }));

          await resend.emails.send({
            from: env.FROM_EMAIL || "noreply@getpaperjet.com",
            to: email,
            subject: "Sign in to PaperJet",
            html: emailHtml,
          });
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          throw error;
        }
      }
    })
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      enabled:
        env.GOOGLE_CLIENT_ID !== undefined &&
        env.GOOGLE_CLIENT_SECRET !== undefined,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.BASE_URL,
    },
    microsoft: {
      enabled:
        env.MICROSOFT_CLIENT_ID !== undefined &&
        env.MICROSOFT_CLIENT_SECRET !== undefined,
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      redirectUri: env.BASE_URL,
    },
  },
  trustedOrigins: [env.BASE_URL],
});

// Helper function to check if a path matches a pattern with wildcards
const matchesPattern = (path: string, pattern: string): boolean => {
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -2); // Remove /** from the end
    return path.startsWith(prefix);
  }
  return path === pattern;
};

// Authentication middleware
export const requireAuth = async (c: any, next: any) => {
  // Skip auth check for public routes
  if (publicRoutes.some((pattern) => matchesPattern(c.req.path, pattern))) {
    return next();
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

export const authHandler = async (c: any) => {
  return auth.handler(c.req.raw);
};

export const getUser = async (c: any): Promise<User> => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session.user;
};
