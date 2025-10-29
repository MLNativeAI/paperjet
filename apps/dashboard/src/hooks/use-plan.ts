import { useRouteContext } from "@tanstack/react-router";
import { useBilling } from "./use-billing";

export function usePlan() {
  const { serverInfo } = useRouteContext({ from: "__root__" });
  const { planType, isLoading } = useBilling();

  const hasActivePlan = () => {
    if (serverInfo.saasMode) {
      return true;
    } else {
      return planType !== "none";
    }
  };
  const isPro = planType === "pro";

  return {
    planType: planType === "none" ? "free" : planType,
    activePlan: hasActivePlan(),
    isPro,
    isLoading,
  };
}

export type PlanType = "free" | "basic" | "pro";
