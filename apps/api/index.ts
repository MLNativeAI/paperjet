import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import files from './routes/files'
import { auth, authHandler, requireAuth } from './lib/auth'
import { corsMiddleware } from './lib/cors'
import { logger } from 'hono/logger'
import { poweredBy } from 'hono/powered-by'
import { envVars } from './lib/env'

const app = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null
    }
}>();

app.use(poweredBy({ serverName: "mlnative.com" }))
app.use(logger())
// Cors middleware for local development
app.use("/api/*", corsMiddleware);
// Require authentication for all API routes
app.use("/api/*", requireAuth);
// BetterAuth handler
app.on(["POST", "GET"], "/api/auth/*", authHandler);

// Health check
app.get('/api/health', async (c) => {
    return c.json({
        status: 'ok'
    })
})

export const apiRoutes = app.basePath('/api').route('/files', files)

if (envVars.ENVIRONMENT === "prod") {
    // Serve static files
    app.get('*', serveStatic({ root: './public' }))
    app.get('*', serveStatic({ path: './public/index.html' }))
} else {
    app.get('*', (c) => {
        return c.redirect('http://localhost:5173')
    })
}

const server = Bun.serve({
    port: envVars.PORT,
    hostname: "0.0.0.0",
    fetch: app.fetch,
});

console.log(`🚀 Server running on port ${server.port} in ${envVars.ENVIRONMENT} mode`);

export type ApiRoutes = typeof apiRoutes