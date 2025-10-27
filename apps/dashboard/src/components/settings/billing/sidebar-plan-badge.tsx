import { Link } from "@tanstack/react-router";
import CheckoutButton from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useBilling } from "@/hooks/use-billing";

export default function SidebarPlanBadge() {
  const { subscriptionName, hasActiveSubscription, isLoading } = useBilling();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="w-full text-md h-8">
        <Spinner variant="bars" />
      </Badge>
    );
  }

  if (!hasActiveSubscription) {
    return <CheckoutButton />;
  }

  return (
    <Link to="/settings/billing">
      <Badge variant="secondary" className="w-full text-md h-8">
        {subscriptionName}
      </Badge>
    </Link>
  );
}
