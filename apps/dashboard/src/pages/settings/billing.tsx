import SubscriptionInfo from "@/components/settings/billing/subscription-info";
import { UsageInfo } from "@/components/settings/billing/usage-info";
import { useBilling } from "@/hooks/use-billing";
import { useAuthenticatedUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth-client";

export default function BillingPage() {
  const { session } = useAuthenticatedUser();
  const { subscriptions, productMap, isLoading } = useBilling(session?.activeOrganizationId);
  if (isLoading || !subscriptions || !productMap) {
    return null;
  }
  console.log(subscriptions);

  return (
    <div className="space-y-17 pt-8">
      <SubscriptionInfo subscriptions={subscriptions} productMap={productMap} />
      <UsageInfo subscriptions={subscriptions} />
      <div>
        <span>
          You can manage your subscription and invoices in the{" "}
          <button
            type="button"
            onClick={() => {
              authClient.customer.portal({});
            }}
            className="inline font-medium items-center gap-2 underline cursor-pointer"
          >
            customer portal
          </button>
        </span>
      </div>
    </div>
  );
}
