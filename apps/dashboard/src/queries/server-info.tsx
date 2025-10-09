import type { InternalRoutes } from "@paperjet/api/routes";
import { queryOptions } from "@tanstack/react-query";
import { hc } from "hono/client";

const internalClient = hc<InternalRoutes>("/api/internal");

export const serverInfoQueries = {
  serverInfo: () =>
    queryOptions({
      queryKey: ["server-info"],
      queryFn: async () => {
        const response = await internalClient["server-info"].$get({});
        return response.json();
      },
      staleTime: 5000,
    }),
};
