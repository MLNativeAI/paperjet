"use client";

import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/date";

export const description = "A radial chart with text";

export function UsageInfo({
  subscriptions,
}: {
  subscriptions: {
    currentPeriodEnd: Date | null;
    meters: {
      consumedUnits: number;
      creditedUnits: number;
    }[];
  }[];
}) {
  if (subscriptions.length > 0 && subscriptions[0].meters.length > 0) {
    const consumed = subscriptions[0].meters[0].consumedUnits;
    const total = subscriptions[0].meters[0].creditedUnits;

    return (
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Usage</h1>
          <p className="text-muted-foreground">
            You have used {consumed} out of {total} conversions.{" "}
            {subscriptions[0].currentPeriodEnd && (
              <span>Your usage resets {formatRelativeTime(subscriptions[0].currentPeriodEnd)} </span>
            )}
          </p>
        </div>
        <Badge className="secondary w-[100px] text-md">
          {consumed}/{total}
        </Badge>
      </div>
    );
  }

  return null;
}
