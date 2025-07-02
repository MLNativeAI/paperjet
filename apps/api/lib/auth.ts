import { db } from "@paperjet/db";
import * as schema from "@paperjet/db/schema";
import { MagicLinkEmail, render } from "@paperjet/email";
import { generateId, ID_PREFIXES } from "@paperjet/engine";
import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import type { Context, Next } from "hono";
import { Resend } from "resend";
import { envVars } from "./env";
import { logger } from "./logger";

const publicRoutes = ["/api/health", "/api/auth/**"];

const resend = envVars.RESEND_API_KEY ? new Resend(envVars.RESEND_API_KEY) : null;

export const auth = betterAuth({
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // Cache duration in seconds
        },
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    return {
                        data: {
                            ...user,
                            id: generateId(ID_PREFIXES.user),
                        },
                    };
                },
            },
        },
        session: {
            create: {
                before: async (session) => {
                    return {
                        data: {
                            ...session,
                            id: generateId(ID_PREFIXES.session),
                        },
                    };
                },
            },
        },
        account: {
            create: {
                before: async (account) => {
                    return {
                        data: {
                            ...account,
                            id: generateId(ID_PREFIXES.account),
                        },
                    };
                },
            },
        },
        verification: {
            create: {
                before: async (verification) => {
                    return {
                        data: {
                            ...verification,
                            id: generateId(ID_PREFIXES.verification),
                        },
                    };
                },
            },
        },
    },
    plugins: [
        magicLink({
            sendMagicLink: async ({ email, token, url }, _request) => {
                if (!resend) {
                    console.log(`Magic link for ${email}: ${url}`);
                    return;
                }

                try {
                    logger.info(`Sending magic link to ${email}: ${url}`);
                    const emailHtml = await render(MagicLinkEmail({ email, url, token }));

                    await resend.emails.send({
                        from: envVars.FROM_EMAIL,
                        to: email,
                        subject: "Sign in to PaperJet",
                        html: emailHtml,
                    });
                } catch (error) {
                    console.error("Failed to send magic link email:", error);
                    throw error;
                }
            },
        }),
    ],
    socialProviders: {
        google: {
            prompt: "select_account",
            enabled: envVars.GOOGLE_CLIENT_ID !== undefined && envVars.GOOGLE_CLIENT_SECRET !== undefined,
            clientId: envVars.GOOGLE_CLIENT_ID || "",
            clientSecret: envVars.GOOGLE_CLIENT_SECRET || "",
            redirectUri: envVars.BASE_URL,
        },
        microsoft: {
            enabled: envVars.MICROSOFT_CLIENT_ID !== undefined && envVars.MICROSOFT_CLIENT_SECRET !== undefined,
            clientId: envVars.MICROSOFT_CLIENT_ID || "",
            clientSecret: envVars.MICROSOFT_CLIENT_SECRET || "",
            redirectURI: envVars.BASE_URL,
        },
    },
    trustedOrigins: [envVars.BASE_URL],
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
export const requireAuth = async (c: Context, next: Next) => {
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

export const authHandler = async (c: Context) => {
    return auth.handler(c.req.raw);
};

export const getUser = async (c: Context): Promise<User> => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
        throw new Error("Unauthorized");
    }
    return session.user;
};
