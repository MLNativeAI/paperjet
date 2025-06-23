import { db } from "@paperjet/db";
import * as schema from "@paperjet/db/schema";
import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "bun";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const publicRoutes = ["/api/health", "/api/auth/**"];

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: 'sandbox'
});

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
      redirectUri:
        Bun.env.ENVIRONMENT === "dev"
          ? "http://localhost:5173/"
          : "https://hono-react.mlnative.com/",
    },
  },
  trustedOrigins: [
    Bun.env.ENVIRONMENT === "dev" ? "http://localhost:5173" : "",
  ],
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "123-456-789", // ID of Product from Polar Dashboard
              slug: "pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
            }
          ],
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET || "",
          onPayload: (payload) => console.log(payload)
        })
      ],
    })
  ]
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
