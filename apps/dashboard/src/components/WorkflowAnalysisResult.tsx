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
import { Check, X, Plus, Trash2 } from "lucide-react";
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
  const [fields, setFields] = useState<ExtractionField[]>(analysis.analysis.suggestedFields);
  const [tables, setTables] = useState<ExtractionTable[]>(analysis.analysis.suggestedTables);

  const createWorkflow = useMutation({
    mutationFn: async () => {
      const response = await api.workflows.$post({
        json: {
          name: workflowName,
          documentType: analysis.analysis.documentType,
          configuration: {
            fields,
            tables,
          },
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

  const updateField = (index: number, updates: Partial<ExtractionField>) => {
    setFields(fields.map((field, i) => i === index ? { ...field, ...updates } : field));
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addField = () => {
    setFields([...fields, {
      name: "",
      description: "",
      type: "text",
      required: false,
    }]);
  };

  const updateTable = (index: number, updates: Partial<ExtractionTable>) => {
    setTables(tables.map((table, i) => i === index ? { ...table, ...updates } : table));
  };

  const removeTable = (index: number) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Analysis Complete</h1>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Detected document type: <span className="font-semibold">{analysis.analysis.documentType}</span>
          </p>
          <Badge variant="secondary">
            {Math.round(analysis.analysis.confidence * 100)}% confidence
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Workflow Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Enter workflow name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Fields to Extract
            <Button size="sm" variant="outline" onClick={addField}>
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Field Name</Label>
                      <Input
                        value={field.name}
                        onChange={(e) => updateField(index, { name: e.target.value })}
                        placeholder="e.g., invoice_number"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                        value={field.type}
                        onChange={(e) => updateField(index, { type: e.target.value as any })}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="currency">Currency</option>
                        <option value="boolean">Boolean</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeField(index)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={field.description}
                    onChange={(e) => updateField(index, { description: e.target.value })}
                    placeholder="Brief description of this field"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${index}`}
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor={`required-${index}`} className="cursor-pointer">
                    Required field
                  </Label>
                </div>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No fields configured. Click "Add Field" to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {tables.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tables to Extract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tables.map((table, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex-1">
                      <Label>Table Name</Label>
                      <Input
                        value={table.name}
                        onChange={(e) => updateTable(index, { name: e.target.value })}
                        placeholder="e.g., line_items"
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeTable(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-3">
                    <Label>Description</Label>
                    <Input
                      value={table.description}
                      onChange={(e) => updateTable(index, { description: e.target.value })}
                      placeholder="Brief description of this table"
                    />
                  </div>
                  <div>
                    <Label>Columns</Label>
                    <div className="mt-2 space-y-2">
                      {table.columns.map((column, colIndex) => (
                        <div key={colIndex} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{column.name}</Badge>
                          <span className="text-muted-foreground">({column.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Start Over
        </Button>
        <Button 
          onClick={() => createWorkflow.mutate()}
          disabled={createWorkflow.isPending || !workflowName || fields.length === 0}
        >
          {createWorkflow.isPending ? "Creating..." : "Create Workflow"}
        </Button>
      </div>
    </div>
  );
}