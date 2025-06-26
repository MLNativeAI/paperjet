import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Edit3, Save, X, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ExtractionField, ExtractionTable } from "@paperjet/db/types";

interface FieldConfigurationProps {
  fields: ExtractionField[];
  tables: ExtractionTable[];
  onFieldsChange: (fields: ExtractionField[]) => void;
  onTablesChange: (tables: ExtractionTable[]) => void;
  isExtractionOutdated: boolean;
  onReprocess: () => void;
  isReprocessing?: boolean;
}

export function FieldConfiguration({ 
  fields, 
  tables, 
  onFieldsChange, 
  onTablesChange,
  isExtractionOutdated,
  onReprocess,
  isReprocessing = false
}: FieldConfigurationProps) {
  const [editingField, setEditingField] = useState<number | null>(null);
  const [editingTable, setEditingTable] = useState<number | null>(null);

  const updateField = (index: number, updates: Partial<ExtractionField>) => {
    const updatedFields = fields.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
  };

  const addField = () => {
    const newField: ExtractionField = {
      name: `new_field_${fields.length + 1}`,
      description: "New field description",
      type: "text",
      required: false,
    };
    onFieldsChange([...fields, newField]);
  };

  const removeField = (index: number) => {
    onFieldsChange(fields.filter((_, i) => i !== index));
  };

  const updateTable = (index: number, updates: Partial<ExtractionTable>) => {
    const updatedTables = tables.map((table, i) => 
      i === index ? { ...table, ...updates } : table
    );
    onTablesChange(updatedTables);
  };

  const addTable = () => {
    const newTable: ExtractionTable = {
      name: `new_table_${tables.length + 1}`,
      description: "New table description",
      columns: [
        {
          name: "column_1",
          description: "Column description",
          type: "text",
          required: false,
        },
      ],
    };
    onTablesChange([...tables, newTable]);
  };

  const removeTable = (index: number) => {
    onTablesChange(tables.filter((_, i) => i !== index));
  };

  const addColumnToTable = (tableIndex: number) => {
    const table = tables[tableIndex];
    const newColumn: ExtractionField = {
      name: `column_${table.columns.length + 1}`,
      description: "Column description",
      type: "text",
      required: false,
    };
    updateTable(tableIndex, {
      columns: [...table.columns, newColumn],
    });
  };

  const updateTableColumn = (tableIndex: number, columnIndex: number, updates: Partial<ExtractionField>) => {
    const table = tables[tableIndex];
    const updatedColumns = table.columns.map((column, i) => 
      i === columnIndex ? { ...column, ...updates } : column
    );
    updateTable(tableIndex, { columns: updatedColumns });
  };

  const removeColumnFromTable = (tableIndex: number, columnIndex: number) => {
    const table = tables[tableIndex];
    const updatedColumns = table.columns.filter((_, i) => i !== columnIndex);
    updateTable(tableIndex, { columns: updatedColumns });
  };

  return (
    <div className="space-y-6">
      {/* Extraction Status Alert */}
      {isExtractionOutdated && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Field configuration has been modified. Re-process the document to see updated extraction results.
          </AlertDescription>
        </Alert>
      )}

      {/* Fields Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Field Configuration</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={addField}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {editingField === index ? (
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          className="font-medium max-w-xs"
                          placeholder="Field name"
                        />
                      ) : (
                        <Label className="font-medium">{field.name}</Label>
                      )}
                      
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, { type: value as any })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="currency">Currency</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <Button size="sm" onClick={() => setEditingField(null)}>
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
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingField(index)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeField(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tables Configuration */}
      {tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Table Configuration</span>
              <Button
                size="sm"
                variant="outline"
                onClick={addTable}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Table
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tables.map((table, tableIndex) => (
                <div key={tableIndex} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      {editingTable === tableIndex ? (
                        <div className="space-y-2">
                          <Input
                            value={table.name}
                            onChange={(e) => updateTable(tableIndex, { name: e.target.value })}
                            className="font-medium max-w-xs"
                            placeholder="Table name"
                          />
                          <Textarea
                            value={table.description}
                            onChange={(e) => updateTable(tableIndex, { description: e.target.value })}
                            placeholder="Table description"
                            className="text-sm"
                            rows={2}
                          />
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium">{table.name}</h4>
                          <p className="text-sm text-muted-foreground">{table.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTable(editingTable === tableIndex ? null : tableIndex)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTable(tableIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Table Columns */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">COLUMNS</Label>
                    {table.columns.map((column, columnIndex) => (
                      <div key={columnIndex} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Input
                          value={column.name}
                          onChange={(e) => updateTableColumn(tableIndex, columnIndex, { name: e.target.value })}
                          className="max-w-xs"
                          placeholder="Column name"
                        />
                        <Select
                          value={column.type}
                          onValueChange={(value) => updateTableColumn(tableIndex, columnIndex, { type: value as any })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="currency">Currency</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeColumnFromTable(tableIndex, columnIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addColumnToTable(tableIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Column
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reprocess Button */}
      <div className="flex justify-center">
        <Button
          onClick={onReprocess}
          disabled={isReprocessing}
          variant={isExtractionOutdated ? "default" : "outline"}
          size="lg"
        >
          {isReprocessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Document...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reprocess Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
}