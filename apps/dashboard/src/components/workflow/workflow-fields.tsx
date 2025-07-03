import type { ValidWorkflowWithSample } from "@paperjet/db/types";

export default function WorkflowFields({ workflow }: { workflow: ValidWorkflowWithSample }) {
    if (!workflow?.configuration.fields || workflow.configuration.fields.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No fields configured</p>
            </div>
        );
    }

    // Group fields by category
    const fieldsByCategory = workflow.configuration.fields.reduce(
        (acc, field) => {
            // Handle both new category object format and legacy string format
            const category = typeof field.category === 'object'
                ? field.category?.displayName
                : field.category || "General Information";

            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(field);
            return acc;
        },
        {} as Record<string, typeof workflow.configuration.fields>,
    );

    const categories = Object.entries(fieldsByCategory).sort(([a], [b]) => a.localeCompare(b));

    return (
        <div className="space-y-6">
            {categories.map(([category, fields]) => (
                <div key={category} className="space-y-4">
                    <h4 className="text-md font-semibold text-primary border-b pb-2">
                        {category}
                    </h4>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                        {fields.map((field) => (
                            <div key={field.name} className="p-4 border rounded-lg">
                                {field.sampleValue ? (
                                    <div className="space-y-2">
                                        <p className="text-base font-medium">{String(field.sampleValue)}</p>
                                        <p className="text-sm text-muted-foreground">{field.name}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-base font-medium text-muted-foreground">No sample value</p>
                                        <p className="text-sm text-muted-foreground">{field.name}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}