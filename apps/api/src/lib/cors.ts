import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";

// Cors middleware that only applies in development mode
export const corsMiddleware: MiddlewareHandler = (c, next) => {
  if (Bun.env.ENVIRONMENT === "dev") {
    return cors({
      origin: "http://localhost:5173",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })(c, next);
  }
  return next();
};
