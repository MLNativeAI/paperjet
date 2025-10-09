import { ExecutionListTable } from "@/components/execution-list-table";
import { useExecutions } from "@/hooks/use-executions";

export default function ExecutionListPage() {
  const { executions, isLoading } = useExecutions();

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8">
        <div>Loading executions...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Executions</h1>
          <p className="text-muted-foreground mt-2">Review and export executions from all workflows</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Runs</h2>
        </div>

        <ExecutionListTable data={executions || []} />
      </div>
    </div>
  );
}
