import { useBilling } from "./use-billing";

export function usePlan() {
  const { planType, isLoading } = useBilling();

  const hasActivePlan = planType !== "none";
  const isPro = planType === "pro";

  return {
    planType: planType === "none" ? "free" : planType,
    hasActivePlan,
    isPro,
    isLoading,
  };
}

export type PlanType = "free" | "basic" | "pro";
