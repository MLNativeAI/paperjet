import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PlanBadge({ planName }: { planName: string }) {
  // switch (planName) {
  //   case "Basic":
  //     return <Badge className="w-[150px] bg-yellow-900">PaperJet Basic Plan</Badge>;
  //   case "Pro":
  //     return <Badge className="w-[150px] bg-blue-900">PaperJet Pro Plan</Badge>;
  // }
  return <Badge className="default w-[100px] text-md">{planName}</Badge>;
}
