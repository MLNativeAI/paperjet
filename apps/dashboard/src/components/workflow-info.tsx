import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkflowConfiguration {
  fields?: { length: number } | [];
  tables?: { length: number } | [];
}

interface WorkflowInfoProps {
  configuration: WorkflowConfiguration;
}

export function WorkflowInfo({ configuration }: WorkflowInfoProps) {
  const fieldsCount = Array.isArray(configuration.fields) ? configuration.fields.length : 0;
  const tablesCount = Array.isArray(configuration.tables) ? configuration.tables.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fields to Extract</p>
            <p className="text-lg">{fieldsCount} fields</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tables to Extract</p>
            <p className="text-lg">{tablesCount} tables</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
