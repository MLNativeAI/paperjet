import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  capture_pageview: 'history_change',
  capture_pageleave: true, // Enable pageleave capture
  capture_exceptions: true, // Enable exception tracking
  debug: process.env.NODE_ENV === "development",
});