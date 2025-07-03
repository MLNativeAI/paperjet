import type { Workflow } from "@paperjet/engine/types";
import { CategoryGroup } from "./workflow-categories";

export default function WorkflowFields({ category, workflow }: { category: CategoryGroup, workflow: Workflow }) {

    // Get sample data for fields
    const getSampleValue = (fieldName: string) => {
        if (!workflow.sampleData?.fields) return null;
        const sampleField = workflow.sampleData.fields.find((f) => f.fieldName === fieldName);
        return sampleField?.value;
    };

    return (
        category.fields.length > 0 && (
            <div className="space-y-3">
                <h4 className="text-md font-medium">Fields</h4>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    {category.fields.map((field) => {
                        const sampleValue = getSampleValue(field.name);
                        return (
                            <div key={field.name} className="p-4 border rounded-lg">
                                {sampleValue !== null && sampleValue !== undefined ? (
                                    <div className="space-y-2">
                                        <p className="text-base font-medium">{String(sampleValue)}</p>
                                        <p className="text-sm text-muted-foreground">{field.name}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">
                                            No sample value
                                        </p>
                                        <p className="text-sm text-muted-foreground">{field.name}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    );
}
