import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PlanBadge({ planName }: { planName: string }) {
  return (
    <Badge variant="secondary" className="w-[100px] text-md">
      {planName}
    </Badge>
  );
}
