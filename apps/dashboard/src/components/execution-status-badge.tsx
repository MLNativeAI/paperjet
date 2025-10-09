import { CheckCircle, Clock, Loader, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ExecutionStatus = "Queued" | "Processing" | "Completed" | "Failed";

interface ExecutionStatusBadgeProps {
  status: ExecutionStatus;
  className?: string;
}

const statusConfig = {
  Queued: {
    label: "Queued",
    icon: Clock,
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  Processing: {
    label: "Processing",
    icon: Loader,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  Failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-200",
  },
} as const;

export function ExecutionStatusBadge({ status, className }: ExecutionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium",
        config.className,
        status === "Processing" && "animate-pulse",
        className,
      )}
    >
      <Icon className={cn("h-3 w-3", status === "Processing" && "animate-spin")} />
      {config.label}
    </Badge>
  );
}
