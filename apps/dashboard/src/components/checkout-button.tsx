import { Crown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

export default function CheckoutButton() {
  const { activeOrganization } = useOrganization();
  return (
    <Button
      className="cursor-pointer"
      onClick={async () => {
        console.log(`Checking out with org id ${activeOrganization.id}`);
        await authClient.checkout({
          products: ["f772061e-7ef7-4628-b7e2-c7f9c2eb44a7", "9f067529-438f-44ca-9c5c-f7128b3dd9b3"],
          referenceId: activeOrganization?.id || "",
        });
      }}
    >
      <Crown />
      Start 14 day trial
    </Button>
  );
}
