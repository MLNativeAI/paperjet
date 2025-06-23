import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Edit3, Save, X } from "lucide-react";
import { toast } from "sonner";
import type { 
  DocumentAnalysis, 
  ExtractionField, 
  ExtractionTable, 
  ExtractionResult 
} from "@paperjet/db/types";

interface ExtractionResultsProps {
  fileId: string;
  analysis: DocumentAnalysis;
  onCreateWorkflow: (fields: ExtractionField[], tables: ExtractionTable[]) => void;
  isCreatingWorkflow: boolean;
}

export function ExtractionResults({ 
  fileId, 
  analysis, 
  onCreateWorkflow, 
  isCreatingWorkflow 
}: ExtractionResultsProps) {
  const [fields, setFields] = useState<ExtractionField[]>(analysis.suggestedFields);
  const [tables, setTables] = useState<ExtractionTable[]>(analysis.suggestedTables);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [editingField, setEditingField] = useState<number | null>(null);

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

  // Auto-extract when component mounts
  useEffect(() => {
    if (!extractionResult) {
      extractData.mutate();
    }
  }, []);

  const updateField = (index: number, updates: Partial<ExtractionField>) => {
    setFields(fields.map((field, i) => i === index ? { ...field, ...updates } : field));
  };

  const saveFieldEdit = (index: number) => {
    setEditingField(null);
    // Re-extract data with updated field
    extractData.mutate();
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">No data found</span>;
    }
    
    switch (type) {
      case "currency":
        return typeof value === "number" ? `$${value.toFixed(2)}` : value;
      case "date":
        return value;
      case "boolean":
        return value ? "Yes" : "No";
      default:
        return value.toString();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-4">
      {/* Field Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Field Configuration</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => extractData.mutate()}
              disabled={extractData.isPending}
            >
              {extractData.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Re-extract
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="font-medium">{field.name}</Label>
                      <Badge variant="outline" className="text-xs">
                        {field.type}
                      </Badge>
                      {extractionResult && (
                        <Badge 
                          className={`text-xs ${getConfidenceColor(
                            extractionResult.fields.find(f => f.fieldName === field.name)?.confidence || 0
                          )}`}
                        >
                          {Math.round((extractionResult.fields.find(f => f.fieldName === field.name)?.confidence || 0) * 100)}%
                        </Badge>
                      )}
                    </div>
                    
                    {editingField === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={field.description}
                          onChange={(e) => updateField(index, { description: e.target.value })}
                          placeholder="Field description for AI extraction"
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveFieldEdit(index)}>
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingField(index)}
                          className="ml-2"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Extracted Value */}
                {extractionResult && (
                  <div className="mt-3 p-3 bg-muted rounded border-l-4 border-l-blue-500">
                    <Label className="text-xs font-medium text-muted-foreground">EXTRACTED VALUE</Label>
                    <div className="mt-1 text-sm font-medium">
                      {formatValue(
                        extractionResult.fields.find(f => f.fieldName === field.name)?.value,
                        field.type
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables */}
      {tables.length > 0 && extractionResult && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tables.map((table, tableIndex) => {
                const extractedTable = extractionResult.tables.find(t => t.tableName === table.name);
                return (
                  <div key={tableIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{table.name}</h4>
                        <p className="text-sm text-muted-foreground">{table.description}</p>
                      </div>
                      {extractedTable && (
                        <Badge className={getConfidenceColor(extractedTable.confidence)}>
                          {Math.round(extractedTable.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    
                    {extractedTable && extractedTable.rows.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-muted">
                              {table.columns.map((column, colIndex) => (
                                <th key={colIndex} className="border border-gray-200 px-3 py-2 text-left font-medium">
                                  {column.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {extractedTable.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-muted/50">
                                {table.columns.map((column, colIndex) => (
                                  <td key={colIndex} className="border border-gray-200 px-3 py-2">
                                    {formatValue(row.values[column.name], column.type)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No table data extracted
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Workflow Button */}
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
    </div>
  );
}