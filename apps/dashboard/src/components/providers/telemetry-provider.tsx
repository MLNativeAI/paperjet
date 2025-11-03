import { PostHogProvider } from "@posthog/react";
import { useRouteContext } from "@tanstack/react-router";
import posthog from "posthog-js";

export default function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const { serverInfo } = useRouteContext({ from: "__root__" });

  if (serverInfo.posthogKey && !posthog.__loaded) {
    posthog.init(serverInfo.posthogKey, {
      api_host: "https://eu.i.posthog.com",
      defaults: "2025-05-24",
    });
    console.log("Telemetry is enabled");
  }

  if (posthog.__loaded) {
    return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
  } else {
    return <>{children}</>;
  }
}
