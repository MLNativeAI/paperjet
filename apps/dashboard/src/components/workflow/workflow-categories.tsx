import type { FieldsConfiguration, TableConfiguration, Workflow } from "@paperjet/engine/types";
import WorkflowFields from "./workflow-fields";
import WorkflowTables from "./workflow-tables";

export interface CategoryGroup {
    categoryId: string;
    name: string;
    ordinal: number;
    fields: FieldsConfiguration[number][];
    tables: TableConfiguration[number][];
}

export default function WorkflowCategories({ workflow }: { workflow: Workflow }) {
    // Group fields and tables by category
    const categoriesMap = new Map<string, CategoryGroup>();

    // Initialize categories
    workflow.categories.forEach((cat) => {
        categoriesMap.set(cat.categoryId, {
            categoryId: cat.categoryId,
            name: cat.displayName,
            ordinal: cat.ordinal,
            fields: [],
            tables: [],
        });
    });

    // Add fields to their categories
    workflow.configuration.fields.forEach((field) => {
        const category = categoriesMap.get(field.categoryId);
        if (category) {
            category.fields.push(field);
        }
    });

    // Add tables to their categories
    workflow.configuration.tables.forEach((table) => {
        const category = categoriesMap.get(table.categoryId);
        if (category) {
            category.tables.push(table);
        }
    });

    // Sort categories by ordinal
    const sortedCategories = Array.from(categoriesMap.values()).sort((a, b) => a.ordinal - b.ordinal);

    if (sortedCategories.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No categories configured</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {sortedCategories.map((category) => (
                <div key={category.categoryId} className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary border-b pb-2">{category.name}</h3>
                    <WorkflowFields category={category} workflow={workflow} />
                    <WorkflowTables category={category} workflow={workflow} />
                </div>
            ))}
        </div>
    );
}
