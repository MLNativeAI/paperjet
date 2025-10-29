import { Crown } from "lucide-react";
import { useOrganization } from "@/hooks/use-organization";
import { useBillingProducts } from "@/hooks/use-billing-products";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function CheckoutButton() {
  const { activeOrganization } = useOrganization();
  const { data: billingData, isLoading, error } = useBillingProducts();

  const handleCheckout = async () => {
    if (!billingData?.productIds.length) {
      console.error("No billing products available");
      return;
    }

    console.log(`Checking out with org id ${activeOrganization?.id}`);
    await authClient.checkout({
      products: billingData.productIds,
      referenceId: activeOrganization?.id || "",
    });
  };

  if (isLoading) {
    return (
      <Button disabled className="cursor-pointer">
        <Crown />
        Loading...
      </Button>
    );
  }

  if (error || !billingData?.productIds.length) {
    return (
      <Button disabled className="cursor-pointer">
        <Crown />
        Checkout unavailable
      </Button>
    );
  }

  return (
    <Button className="cursor-pointer" onClick={handleCheckout}>
      <Crown />
      Start 14 day trial
    </Button>
  );
}
