import { ArrowLeft, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowHeaderProps {
  workflowName: string;
  showActions: boolean;
  onBack: () => void;
  onExportResults: () => void;
  onViewHistory: () => void;
}

export function WorkflowHeader({
  workflowName,
  showActions,
  onBack,
  onExportResults,
  onViewHistory,
}: WorkflowHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </Button>
        <h1 className="text-3xl font-bold">Execute Workflow</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-muted-foreground">{workflowName}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportResults}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline" onClick={onViewHistory}>
            <Eye className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>
      )}
    </div>
  );
}
