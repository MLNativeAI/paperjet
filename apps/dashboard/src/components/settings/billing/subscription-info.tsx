import { formatRelativeTime } from "@/lib/utils/date";
import type { TrialInfo } from "@/types";
import PlanBadge from "./plan-badge";
import CheckoutButton from "@/components/checkout-button";

export default function SubscriptionInfo({
  subscriptions,
  productMap,
}: {
  subscriptions: {
    productId: string;
    trialEnd: Date | null;
    currentPeriodEnd: Date | null;
  }[];
  productMap: {
    [productId: string]: {
      name: string;
    };
  };
}) {
  const getSubscriptionName = () => {
    if (subscriptions.length > 0) {
      const productId = subscriptions[0].productId;
      return productMap[productId]?.name;
    }
    return "No active plan";
  };

  const getTrialInformation = (): TrialInfo => {
    if (subscriptions.length > 0) {
      console.log(subscriptions[0].trialEnd);
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

  const subscriptionName = getSubscriptionName();
  const trialInfo = getTrialInformation();

  const hasActiveSubscription = subscriptions.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Active plan</h1>
        {hasActiveSubscription &&
          (trialInfo.onTrial ? (
            <p className="text-muted-foreground">Your trial ends {formatRelativeTime(trialInfo.trialEnd)}</p>
          ) : (
            subscriptions[0].currentPeriodEnd && (
              <p className="text-muted-foreground">
                Your billing period resets at {formatRelativeTime(subscriptions[0].currentPeriodEnd)}
              </p>
            )
          ))}
        {!hasActiveSubscription && <p className="text-muted-foreground">You do not have an active plan.</p>}
      </div>
      {hasActiveSubscription ? <PlanBadge planName={subscriptionName} /> : <CheckoutButton />}
    </div>
  );
}
