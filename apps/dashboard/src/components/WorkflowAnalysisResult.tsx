import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/DocumentPreview";
import { ExtractionResults } from "@/components/ExtractionResults";
import type { DocumentAnalysis, ExtractionField, ExtractionTable } from "@paperjet/db/types";

interface WorkflowAnalysisResultProps {
  analysis: {
    fileId: string;
    analysis: DocumentAnalysis;
  };
  fileId: string;
}

export function WorkflowAnalysisResult({ analysis, fileId }: WorkflowAnalysisResultProps) {
  const navigate = useNavigate();
  const [workflowName, setWorkflowName] = useState(`${analysis.analysis.documentType} Workflow`);

  const createWorkflow = useMutation({
    mutationFn: async (config: { fields: ExtractionField[], tables: ExtractionTable[] }) => {
      const response = await api.workflows.$post({
        json: {
          name: workflowName,
          documentType: analysis.analysis.documentType,
          configuration: config,
          fileId,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to create workflow");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success("Workflow created successfully!");
      navigate({ to: "/" });
    },
    onError: () => {
      toast.error("Failed to create workflow");
    },
  });

  const handleCreateWorkflow = (fields: ExtractionField[], tables: ExtractionTable[]) => {
    createWorkflow.mutate({ fields, tables });
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Analysis Complete</h1>
        <div className="flex items-center gap-4 mb-4">
          <p className="text-muted-foreground">
            Detected document type: <span className="font-semibold">{analysis.analysis.documentType}</span>
          </p>
          <Badge variant="secondary">
            {Math.round(analysis.analysis.confidence * 100)}% confidence
          </Badge>
        </div>
        
        {/* Workflow Name Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Workflow Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Document Preview */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <DocumentPreview fileId={fileId} />
        </div>

        {/* Right Panel - Extraction Results */}
        <div>
          <ExtractionResults
            fileId={fileId}
            analysis={analysis.analysis}
            onCreateWorkflow={handleCreateWorkflow}
            isCreatingWorkflow={createWorkflow.isPending}
          />
        </div>
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Start Over
        </Button>
      </div>
    </div>
  );
}