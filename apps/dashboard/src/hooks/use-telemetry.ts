import { usePostHog } from "@posthog/react";
import { useEffect } from "react";
import { Route } from "@/routes/_app";
import { useOrganization } from "./use-organization";
import { useAuthenticatedUser } from "./use-user";

export function useTelemetry() {
  const { user } = useAuthenticatedUser();
  const { activeOrganization } = useOrganization();
  const { signedIn, newUser } = Route.useSearch();
  const posthog = usePostHog();

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      });
    }
  }, [user, posthog]);

  useEffect(() => {
    if (activeOrganization) {
      posthog.group("company", activeOrganization.id, {
        name: activeOrganization.name,
        created_at: activeOrganization.createdAt,
        slug: activeOrganization.slug,
      });
    }
  }, [activeOrganization, posthog]);

  useEffect(() => {
    if (signedIn === true && user) {
      posthog.capture("user_signed_in", {
        email: user.email,
        company_id: activeOrganization?.id,
      });
    }
  }, [signedIn, user, activeOrganization, posthog]);

  useEffect(() => {
    if (newUser === true && user) {
      posthog.capture("user_signed_up", {
        email: user.email,
        company_id: activeOrganization?.id,
      });
    }
  }, [newUser, user, activeOrganization, posthog]);
}
