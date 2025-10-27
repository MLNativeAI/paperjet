import { Link } from "@tanstack/react-router";
import CheckoutButton from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { useBilling } from "@/hooks/use-billing";

export default function SidebarPlanBadge() {
  const { subscriptionName, hasActiveSubscription } = useBilling();

  if (!hasActiveSubscription) {
    return <CheckoutButton />;
  }

  return (
    <Link to="/settings/billing">
      <Badge variant="secondary" className="w-full text-md">
        {subscriptionName}
      </Badge>
    </Link>
  );
}
