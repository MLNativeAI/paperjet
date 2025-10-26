import { Star } from "lucide-react";
import { useAuthenticatedUser } from "@/hooks/use-user";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function CheckoutButton() {
  const { session } = useAuthenticatedUser();
  return (
    <Button
      onClick={async () => {
        await authClient.checkout({
          products: ["f772061e-7ef7-4628-b7e2-c7f9c2eb44a7"],
          referenceId: session?.activeOrganizationId || "",
        });
      }}
    >
      <Star />
      Upgrade
    </Button>
  );
}
