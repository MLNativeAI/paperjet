import type { LucideIcon } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

interface WorkflowTemplateCardProps {
    template: WorkflowTemplate;
    onClick: (templateId: string) => void;
}

export function WorkflowTemplateCard({ template, onClick }: WorkflowTemplateCardProps) {
    const Icon = template.icon;

    return (
        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50" onClick={() => onClick(template.id)}>
            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 ${template.color}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
