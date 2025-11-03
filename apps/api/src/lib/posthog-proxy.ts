import { Hono } from "hono";

const API_HOST = "eu.i.posthog.com";
const ASSET_HOST = "eu-assets.i.posthog.com";

export const posthogProxy = new Hono();

posthogProxy.all("/*", async (c) => {
  const pathname = c.req.path;
  const posthogHost = pathname.startsWith("/static/") ? ASSET_HOST : API_HOST;

  const targetUrl = new URL(pathname.replace(/^\/ph/, "") + c.req.query(), `https://${posthogHost}`);

  const headers = new Headers(c.req.raw.headers);
  headers.set("host", posthogHost);
  headers.delete("cookie");
  headers.delete("connection");

  try {
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers,
      body: c.req.raw.body,
    });

    const responseHeaders = new Headers(response.headers);
    if (responseHeaders.has("content-encoding")) {
      responseHeaders.delete("content-encoding");
      responseHeaders.delete("content-length");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("PostHog proxy error:", error);
    return c.json({ error: "Bad Gateway" }, 502);
  }
});
