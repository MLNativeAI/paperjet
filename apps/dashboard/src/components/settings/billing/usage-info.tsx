"use client";

import { Badge } from "@/components/ui/badge";
import { useBilling } from "@/hooks/use-billing";
import { formatRelativeTime } from "@/lib/utils/date";

export function UsageInfo() {
  const { usageInfo } = useBilling();

  if (!usageInfo.hasUsage) {
    return null;
  }

  const { consumed, total, currentPeriodEnd } = usageInfo;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold">Usage</h1>
        <p className="text-muted-foreground">
          You have used {consumed} out of {total} conversions. Note: This value might be slow to update
        </p>
        <p className="text-muted-foreground">
          {currentPeriodEnd && <span>Your usage resets {formatRelativeTime(currentPeriodEnd)} </span>}
        </p>
      </div>
      <Badge variant="secondary" className="w-[100px] text-md">
        {consumed}/{total}
      </Badge>
    </div>
  );
}
