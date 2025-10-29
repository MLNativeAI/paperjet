import { useRouteContext } from "@tanstack/react-router";
import OnPremBillingPage from "./on-prem-billing-page";
import SaasBillingPage from "./saas-billing-page";

export default function BillingPage() {
  const { serverInfo } = useRouteContext({ from: "__root__" });

  if (serverInfo.saasMode) {
    return <SaasBillingPage />;
  }

  return <OnPremBillingPage />;
}
