import { useBilling } from "@/hooks/use-billing";
import { useAuthenticatedUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth-client";
import { formatRelativeTime } from "@/lib/utils/date";
import type { TrialInfo } from "@/types";

export default function BillingPage() {
  const { session } = useAuthenticatedUser();
  const { subscriptions, productMap, isLoading } = useBilling(session?.activeOrganizationId);
  if (isLoading || !subscriptions || !productMap) {
    return null;
  }

  const getSubscriptionName = () => {
    if (subscriptions.length > 0) {
      const productId = subscriptions[0].productId;
      return productMap[productId]?.name;
    }
    return "No active plan";
  };

  const getTrialInformation = (): TrialInfo => {
    if (subscriptions.length > 0) {
      const trialEnd = subscriptions[0].trialEnd;
      if (trialEnd) {
        return {
          onTrial: true,
          trialEnd: trialEnd,
        };
      }
    }
    return {
      onTrial: false,
      trialEnd: undefined,
    };
  };

  return (
    <div className="space-y-17 pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Subscription</h2>
        <p>{getSubscriptionName()}</p>
        <p className="text-muted-foreground"></p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Usage</h2>
        {subscriptions.length > 0 && subscriptions[0].meters.length > 0 && (
          <div>
            <div>
              consumed units:
              {subscriptions[0].meters[0].consumedUnits}
            </div>
            <div>
              Balance:
              {subscriptions[0].meters[0].creditedUnits}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Trial Info</h2>
        {/* {getTrialInformation() ? <div>Your trial ends {formatRelativeTime(getTrialInformation().trialEnd)}</div> : null} */}
      </div>
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
