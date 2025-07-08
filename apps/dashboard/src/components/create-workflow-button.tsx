import type { ExtractionResult } from "@paperjet/engine/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateWorkflowButtonProps {
  fields: ExtractionField[];
  tables: ExtractionTable[];
  extractionResult: ExtractionResult | null;
  isCreatingWorkflow: boolean;
  onCreateWorkflow: (fields: ExtractionField[], tables: ExtractionTable[]) => void;
}

export function CreateWorkflowButton({
  fields,
  tables,
  extractionResult,
  isCreatingWorkflow,
  onCreateWorkflow,
}: CreateWorkflowButtonProps) {
  return (
    <div className="flex justify-end">
      <Button
        onClick={() => onCreateWorkflow(fields, tables)}
        disabled={isCreatingWorkflow || !extractionResult || fields.length === 0}
        size="lg"
      >
        {isCreatingWorkflow ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating Workflow...
          </>
        ) : (
          "Create Workflow"
        )}
      </Button>
    </div>
  );
}
