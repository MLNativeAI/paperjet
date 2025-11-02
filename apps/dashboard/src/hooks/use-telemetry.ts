import { usePostHog } from "@posthog/react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Route } from "@/routes/_app";
import { useOrganization } from "./use-organization";
import { useAuthenticatedUser } from "./use-user";

export function useTelemetry() {
  const { user } = useAuthenticatedUser();
  const { activeOrganization } = useOrganization();
  // const { signedIn, newUser } = Route.useSearch();
  const posthog = usePostHog();
  // useEffect(() => {
  //   if (signedIn === true && user) {
  //     posthog.identify(user.id, {
  //       email: user?.email,
  //     });
  //     if (activeOrganization) {
  //       posthog.group("company", activeOrganization?.id);
  //     }
  //     toast.success("Welcome back!");
  //   }
  // }, [signedIn]);
  // useEffect(() => {
  //   if (newUser === true) {
  //     toast.success("Hi new user");
  //   }
  // }, [newUser]);
}
