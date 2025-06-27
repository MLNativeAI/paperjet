import type { ExtractionField, ExtractionResult, ExtractionTable } from "@paperjet/db/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DocumentPreview } from "@/components/DocumentPreview";
import { ExtractedValues } from "@/components/ExtractedValues";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function WorkflowConfigurePage() {
  const navigate = useNavigate();
  const { workflowId } = useParams({ from: "/_app/workflows/$workflowId/configure" });
  const [workflowName, setWorkflowName] = useState("");
  const [fields, setFields] = useState<ExtractionField[]>([]);
  const [tables, setTables] = useState<ExtractionTable[]>([]);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [fileId, setFileId] = useState<string>("");
  const [documentType, setDocumentType] = useState<string>("");
  const [analysisStatus, setAnalysisStatus] = useState<"pending" | "processing" | "completed">("pending");

  // Fetch workflow data
  const { data: workflow, isLoading } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      const response = await api.workflows[":id"].$get({
        param: { id: workflowId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workflow");
      }

      return response.json();
    },
    enabled: !!workflowId,
  });

  // Query to poll for analysis status
  const { data: analysisData } = useQuery({
    queryKey: ["workflow-analysis", workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}/analysis-status`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analysis status");
      }
      
      return response.json();
    },
    enabled: !!workflowId,
    refetchInterval: (data) => {
      // Stop polling when analysis is complete
      return data?.analysisComplete ? false : 2000;
    },
  });

  // Initialize state when workflow data loads
  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setDocumentType(workflow.documentType);
      setFields(workflow.configuration.fields);
      setTables(workflow.configuration.tables);
      setFileId(workflow.fileId || "");
      
      // Set initial analysis status based on workflow data
      if (workflow.documentType === "Unknown") {
        setAnalysisStatus("processing");
      } else {
        setAnalysisStatus("completed");
      }
    }
  }, [workflow]);

  // Update state when analysis completes
  useEffect(() => {
    if (analysisData) {
      if (analysisData.analysisComplete && analysisStatus !== "completed") {
        setAnalysisStatus("completed");
        setDocumentType(analysisData.documentType);
        
        // Update workflow name and document type in state
        setWorkflowName(`${analysisData.documentType} Workflow`);
      } else if (!analysisData.analysisComplete && analysisStatus === "pending") {
        setAnalysisStatus("processing");
      }
    }
  }, [analysisData, analysisStatus]);

  const extractData = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/workflows/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fileId,
          fields,
          tables,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract data");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setExtractionResult(data.extractionResult);
    },
    onError: () => {
      toast.error("Failed to extract data from document");
    },
  });

  const updateWorkflow = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: workflowName,
          configuration: { fields, tables },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workflow");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Workflow updated successfully!");
      navigate({ to: "/" });
    },
    onError: () => {
      toast.error("Failed to update workflow");
    },
  });


  const handleUpdateWorkflow = () => {
    updateWorkflow.mutate();
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="w-full px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">Workflow not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 space-y-8">
      {/* Header */}
      <div className="">
        <h1 className="text-3xl font-bold mb-2">Configure Workflow</h1>
        <p className="text-muted-foreground">
          Review and save your workflow configuration.
        </p>
      </div>


      {/* Document Preview and Extracted Values */}
      {fields.length > 0 && (

          {/* Side-by-side: Document Preview and Extracted Values */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Document Preview */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <DocumentPreview fileId={fileId} />
            </div>

            {/* Right Panel - Extracted Values */}
            <div>
              <ExtractedValues
                extractionResult={extractionResult}
                fields={fields}
                tables={tables}
                isLoading={extractData.isPending}
              />
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Save Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Enter workflow name"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Document Type: {documentType}</p>
                      <p>Fields: {fields.length} configured</p>
                      <p>Tables: {tables.length} configured</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => navigate({ to: "/" })}>
                    Cancel
                  </Button>

                  <Button
                    onClick={handleUpdateWorkflow}
                    disabled={updateWorkflow.isPending || !workflowName.trim()}
                    size="lg"
                  >
                    {updateWorkflow.isPending ? "Saving Workflow..." : "Save Workflow"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}