import { useSuspenseQuery } from "@tanstack/react-query";
import { authQueries } from "@/queries/auth";

export const useAuthentication = () => {
  const { data: userSession } = useSuspenseQuery(authQueries.session());
  return { userSession, isAuthenticated: !!userSession };
};

export const useAuthenticatedUser = () => {
  const { userSession } = useAuthentication();

  if (!userSession) {
    throw new Error("User is not authenticated!");
  }

  return userSession;
};
