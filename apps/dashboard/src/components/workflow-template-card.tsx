import { toDisplayName } from "@paperjet/engine/utils/display-name";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WorkflowTemplate {
  id: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface WorkflowTemplateCardProps {
  template: WorkflowTemplate;
  onClick: (templateId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function WorkflowTemplateCard({
  template,
  onClick,
  isLoading = false,
  disabled = false,
}: WorkflowTemplateCardProps) {
  const Icon = template.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:shadow-lg hover:border-primary/50",
      )}
      onClick={() => !disabled && onClick(template.id)}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-gray-50 ${template.color}`}>
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{toDisplayName(template.slug)}</CardTitle>
            <CardDescription className="mt-1">
              {isLoading ? "Creating workflow..." : template.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
