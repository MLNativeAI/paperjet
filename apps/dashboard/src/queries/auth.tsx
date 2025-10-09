import { queryOptions } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const authQueries = {
  all: ["auth"],
  session: () =>
    queryOptions({
      queryKey: [...authQueries.all, "session"],
      queryFn: async () => {
        const { data } = await authClient.getSession();
        return { session: data?.session, user: data?.user };
      },
      staleTime: 5000,
    }),
};
