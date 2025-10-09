import { useNavigate } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowsDataTable } from "@/components/workflows-data-table";
import { useWorkflows } from "@/hooks/use-workflows";

export default function WorkflowListPage() {
  const navigate = useNavigate();

  const { workflows, isLoading, handleDeleteWorkflow } = useWorkflows();

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2">Loading workflows...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Workflows</h1>
          <p className="text-muted-foreground mt-2">Manage your document processing workflows</p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            navigate({ to: "/workflows/new" });
          }}
        >
          <Plus className="h-5 w-5" />
          Create New Workflow
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Workflows</h2>
        </div>

        {workflows.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any workflows yet. Start by creating your first workflow.
            </p>
            <Button
              onClick={() => {
                navigate({ to: "/workflows/new" });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Workflow
            </Button>
          </div>
        ) : (
          <WorkflowsDataTable data={workflows} onDeleteWorkflow={handleDeleteWorkflow} />
        )}
      </div>
    </div>
  );
}
