import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddObjectButton } from "@/components/workflow/editor/add-object-button";
import { useWorkflowConfig } from "@/components/workflow/editor/workflow-config-context";
import { WorkflowObjectForm } from "@/components/workflow/editor/workflow-object-form";

interface WorkflowFormProps {
  title: string;
  subtitle: string;
  handleSave: () => Promise<void>;
  isPending: boolean;
  buttonText: string;
}

export function WorkflowForm({ title, subtitle, handleSave, isPending, buttonText }: WorkflowFormProps) {
  const { workflowConfig, name, description, setName, setDescription } = useWorkflowConfig();
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-8 space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id={name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workflow name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id={description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter workflow description"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <CardTitle>Workflow configuration</CardTitle>
        <CardDescription>
          Here you can define objects, fields and tables that will be extracted from your files.
        </CardDescription>
      </div>
      <div className="flex flex-col gap-6">
        {workflowConfig.objects.length === 0 ? (
          <div className="flex flex-col gap-4 items-center text-center py-8">
            <span>You don't have any data defined yet</span>
            <AddObjectButton />
          </div>
        ) : (
          <>
            {workflowConfig.objects.map((object) => (
              <WorkflowObjectForm key={object.id} draftObject={object} />
            ))}
            <AddObjectButton />
          </>
        )}
      </div>

      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={() => navigate({ to: "/" })}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : buttonText}
        </Button>
      </div>
    </div>
  );
}
