import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function CheckoutButton({ organizationId }: { organizationId: string }) {
  return (
    <Button
      onClick={async () => {
        await authClient.checkout({
          products: ["f772061e-7ef7-4628-b7e2-c7f9c2eb44a7"],
          referenceId: organizationId,
        });
      }}
    >
      Upgrade
    </Button>
  );
}
