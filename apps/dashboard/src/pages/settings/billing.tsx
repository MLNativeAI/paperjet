import { useBilling } from "@/hooks/use-billing";
import { authClient } from "@/lib/auth-client";

export default function BillingPage() {
  const { customerState } = useBilling();

  return (
    <div className="space-y-17 pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Subscription</h2>
        <p className="text-muted-foreground">Your billing period resets at x</p>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Usage</h2>
        {customerState && customerState.activeMeters.length > 0 && (
          <div>
            <div>
              consumed units:
              {customerState.activeMeters[0].consumedUnits}
            </div>
            <div>
              Balance:
              {customerState.activeMeters[0].balance}
            </div>
          </div>
        )}
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
