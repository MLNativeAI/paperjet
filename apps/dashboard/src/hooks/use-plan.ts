import { useOrganization } from "./use-organization";

export function usePlan() {
  const { organizationData, isOrgLoading } = useOrganization();

  const hasActivePlan = organizationData?.activePlan !== "free";
  const planType = organizationData?.activePlan || "free";

  return {
    planType,
    hasActivePlan,
    isLoading: isOrgLoading,
  };
}

export type PlanType = "free" | "basic" | "pro";
