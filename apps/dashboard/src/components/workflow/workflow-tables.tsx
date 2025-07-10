import type { Workflow } from "@paperjet/engine/types";
import { useState } from "react";
import EditTableSheet from "./edit-table-sheet";
import type { CategoryGroup } from "./workflow-categories";
import WorkflowTableCard from "./workflow-table-card";

export default function WorkflowTables({ category, workflow }: { category: CategoryGroup; workflow: Workflow }) {
  const [editingTable, setEditingTable] = useState<(typeof category.tables)[number] | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Get sample data for tables
  const getTableSampleData = (tableSlug: string) => {
    if (!workflow.sampleData?.tables) return null;
    const sampleTable = workflow.sampleData.tables.find((t) => t.slug === tableSlug);
    return sampleTable;
  };

  const handleEditTable = (table: (typeof category.tables)[number]) => {
    setEditingTable(table);
    setIsEditSheetOpen(true);
  };

  const handleSaveTable = (_updatedTable: (typeof category.tables)[number]) => {
    // The EditTableSheet component handles the API call internally
    setIsEditSheetOpen(false);
  };

  return (
    <>
      {category.tables.length > 0 && (
        <div className="space-y-4">
          {category.tables.map((table) => {
            const sampleData = getTableSampleData(table.slug);
            return (
              <WorkflowTableCard
                key={table.id}
                table={table}
                sampleData={sampleData}
                sampleDataExtractedAt={workflow.sampleDataExtractedAt}
                onEdit={handleEditTable}
              />
            );
          })}
        </div>
      )}

      {/* Edit Table Sheet */}
      {editingTable && (
        <EditTableSheet
          table={editingTable}
          workflowId={workflow.id}
          isOpen={isEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false);
            setEditingTable(null);
          }}
          onSave={handleSaveTable}
        />
      )}
    </>
  );
}
