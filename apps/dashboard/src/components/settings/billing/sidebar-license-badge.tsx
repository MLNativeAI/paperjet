import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";

export default function SidebarLicenseBadge() {
  return (
    <Link to="/settings/billing">
      <Badge variant="secondary" className="w-full text-md h-8">
        Personal
      </Badge>
    </Link>
  );
}
