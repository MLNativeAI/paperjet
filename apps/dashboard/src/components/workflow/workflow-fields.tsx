import type { Workflow } from "@paperjet/engine/types";

export default function WorkflowFields({ workflow }: { workflow: Workflow }) {
    if (!workflow?.configuration.fields || workflow.configuration.fields.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No fields configured</p>
            </div>
        );
    }

    // Create a map of categoryId to category for quick lookup
    const categoryMap = new Map(
        workflow.categories.map((cat) => [cat.categoryId, cat])
    );

    console.log(categoryMap);

    // Group fields by category
    const fieldsByCategory = workflow.configuration.fields.reduce(
        (acc, field) => {
            console.log(field);
            const categoryId = field.categoryId;
            const category = categoryMap.get(categoryId);
            const categoryName = category?.displayName || "General Information";

            if (!acc[categoryId]) {
                acc[categoryId] = {
                    name: categoryName,
                    ordinal: category?.ordinal || 999,
                    fields: [],
                };
            }
            acc[categoryId].fields.push(field);
            return acc;
        },
        {} as Record<string, { name: string; ordinal: number; fields: typeof workflow.configuration.fields }>,
    );

    // Sort categories by ordinal
    const sortedCategories = Object.entries(fieldsByCategory)
        .sort(([, a], [, b]) => a.ordinal - b.ordinal);

    // Get sample data for fields
    const getSampleValue = (fieldName: string) => {
        if (!workflow.sampleData?.fields) return null;
        const sampleField = workflow.sampleData.fields.find(
            (f) => f.fieldName === fieldName
        );
        return sampleField?.value;
    };

    return (
        <div className="space-y-6">
            {sortedCategories.map(([categoryId, { name, fields }]) => (
                <div key={categoryId} className="space-y-4">
                    <h4 className="text-md font-semibold text-primary border-b pb-2">{name}</h4>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                        {fields.map((field) => {
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
                                            <p className="text-base font-medium text-muted-foreground">No sample value</p>
                                            <p className="text-sm text-muted-foreground">{field.name}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
