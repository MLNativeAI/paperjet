import { Link } from "@tanstack/react-router";
import CheckoutButton from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { usePlan } from "@/hooks/use-plan";

export default function SidebarPlanBadge() {
  const { planType, hasActivePlan, isLoading } = usePlan();

  if (isLoading) {
    return (
      <Badge variant="secondary" className="w-full text-md h-8">
        <Spinner variant="bars" />
      </Badge>
    );
  }

  if (!hasActivePlan) {
    return <CheckoutButton />;
  }

  const planName = planType.charAt(0).toUpperCase() + planType.slice(1);

  return (
    <Link to="/settings/billing">
      <Badge variant="secondary" className="w-full text-md h-8">
        {planName} Plan
      </Badge>
    </Link>
  );
}
