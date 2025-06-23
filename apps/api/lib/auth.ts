import { db } from "@paperjet/db";
import * as schema from "@paperjet/db/schema";
import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { env } from "bun";

const publicRoutes = ["/api/health", "/api/auth/**"];

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      enabled:
        env.GOOGLE_CLIENT_ID !== undefined &&
        env.GOOGLE_CLIENT_SECRET !== undefined,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.AUTH_REDIRECT_URI || "http://localhost:5173/",
    },
    microsoft: {
      enabled:
        env.MICROSOFT_CLIENT_ID !== undefined &&
        env.MICROSOFT_CLIENT_SECRET !== undefined,
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      redirectUri: env.AUTH_REDIRECT_URI || "http://localhost:5173/",
    },
  },
  plugins: [
    magicLink({
      disableSignUp: false,
      expiresIn: 300, // 5 minutes
      sendMagicLink: async ({ email, url }) => {
        if (!env.RESEND_API_KEY) {
          console.log("Magic link URL:", url);
          return;
        }

        try {
          await resend.emails.send({
            from: env.RESEND_FROM_EMAIL || "PaperJet <noreply@paperjet.com>",
            to: email,
            subject: "Sign in to PaperJet",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; text-align: center;">Sign in to PaperJet</h1>
                <p style="color: #666; font-size: 16px;">
                  Click the button below to sign in to your PaperJet account. This link will expire in 5 minutes.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Sign in to PaperJet
                  </a>
                </div>
                <p style="color: #888; font-size: 14px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          throw error;
        }
      },
    }),
  ],
  trustedOrigins: [
    env.TRUSTED_ORIGIN || "http://localhost:5173",
  ],
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
