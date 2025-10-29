import CheckoutButton from "@/components/checkout-button";
import { useBilling } from "@/hooks/use-billing";
import { formatRelativeTime } from "@/lib/utils/date";
import PlanBadge from "./plan-badge";

export default function SubscriptionInfo() {
  const { subscriptionName, trialInfo, hasActiveSubscription, subscriptions } = useBilling();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Active plan</h1>
        {hasActiveSubscription && (
          <>
            {trialInfo.onTrial && (
              <p className="text-muted-foreground">Your trial ends {formatRelativeTime(trialInfo.trialEnd)}</p>
            )}
            {subscriptions?.[0]?.endsAt && (
              <p className="text-muted-foreground">
                Your subscription ends at {formatRelativeTime(subscriptions[0].endsAt)}
              </p>
            )}
            {!trialInfo.onTrial && subscriptions?.[0]?.currentPeriodEnd && (
              <p className="text-muted-foreground">
                Your billing period resets at {formatRelativeTime(subscriptions[0].currentPeriodEnd)}
              </p>
            )}
          </>
        )}
        {!hasActiveSubscription && <p className="text-muted-foreground">You do not have an active plan.</p>}
      </div>
      {hasActiveSubscription ? <PlanBadge planName={subscriptionName || "No active plan"} /> : <CheckoutButton />}
    </div>
  );
}
