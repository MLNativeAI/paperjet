import { useEffect } from "react";
import { toast } from "sonner";
import SubscriptionInfo from "@/components/settings/billing/subscription-info";
import { UsageInfo } from "@/components/settings/billing/usage-info";
import { useBilling } from "@/hooks/use-billing";
import { authClient } from "@/lib/auth-client";
import { Route } from "@/routes/_app/settings/billing";

export default function SaasBillingPage() {
  const { isLoading } = useBilling();
  const { checkout_success } = Route.useSearch();

  useEffect(() => {
    if (checkout_success === true) {
      toast.success("Checkout completed successfully");
    }
  }, [checkout_success]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-17 pt-8">
      <SubscriptionInfo />
      <UsageInfo />
      <div className="flex flex-col gap-4">
        <span>
          You can manage your plan and invoices in the{" "}
          {/** biome-ignore lint/a11y/useValidAnchor: This IS a navigation element */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              authClient.customer.portal({});
            }}
            className="inline font-medium items-center gap-2 underline cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            customer portal.
          </a>
        </span>
        <div>For on-premise licences, reach out to us at contact@getpaperjet.com</div>
      </div>
    </div>
  );
}
