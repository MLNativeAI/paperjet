import type { FieldsConfiguration } from "@paperjet/engine/types";
import { Calendar, FileText, Hash, ToggleLeft, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkflowFieldCardProps {
    field: FieldsConfiguration[number];
    sampleValue: string | number | boolean | Date | null | undefined;
    onEdit: (field: FieldsConfiguration[number]) => void;
}

export default function WorkflowFieldCard({ field, sampleValue, onEdit }: WorkflowFieldCardProps) {
    const getFieldTypeInfo = () => {
        const type = field.type.toLowerCase();
        switch (type) {
            case "text":
            case "string":
                return { icon: Type, label: "Text" };
            case "date":
                return { icon: Calendar, label: "Date" };
            case "number":
            case "integer":
            case "float":
                return { icon: Hash, label: "Number" };
            case "boolean":
                return { icon: ToggleLeft, label: "Boolean" };
            default:
                return { icon: FileText, label: type };
        }
    };

    const typeInfo = getFieldTypeInfo();

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>{sampleValue ? String(sampleValue) : field.name}</CardTitle>
                <CardDescription>{field.name}</CardDescription>
                <CardAction>
                    <Button variant="link" onClick={() => onEdit(field)}>
                        Edit
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                {/* Bottom Row - Badges */}
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-5 text-xs">
                        <typeInfo.icon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
