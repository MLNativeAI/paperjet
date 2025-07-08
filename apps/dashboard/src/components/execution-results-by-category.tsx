import type { ExtractedTable, ExtractedValue, ExtractionResult } from "@paperjet/db/types";
import type { FieldsConfiguration, TableConfiguration, Workflow } from "@paperjet/engine/types";
import { AlertCircle, Calendar, FileText, Hash, ToggleLeft, Type } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ExecutionResultsByCategoryProps {
  extractionResult: ExtractionResult;
  workflow: Workflow;
}

interface CategoryGroup {
  categoryId: string;
  name: string;
  ordinal: number;
  fields: FieldsConfiguration[number][];
  tables: TableConfiguration[number][];
}

export function ExecutionResultsByCategory({ extractionResult, workflow }: ExecutionResultsByCategoryProps) {
  // Group fields and tables by category
  const categoriesMap = new Map<string, CategoryGroup>();

  // Initialize categories
  workflow.categories.forEach((cat) => {
    categoriesMap.set(cat.categoryId, {
      categoryId: cat.categoryId,
      name: cat.displayName,
      ordinal: cat.ordinal,
      fields: [],
      tables: [],
    });
  });

  // Add fields to their categories
  workflow.configuration.fields.forEach((field) => {
    const category = categoriesMap.get(field.categoryId);
    if (category) {
      category.fields.push(field);
    }
  });

  // Add tables to their categories
  workflow.configuration.tables.forEach((table) => {
    const category = categoriesMap.get(table.categoryId);
    if (category) {
      category.tables.push(table);
    }
  });

  // Sort categories by ordinal
  const sortedCategories = Array.from(categoriesMap.values()).sort((a, b) => a.ordinal - b.ordinal);

  const getFieldTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case "text":
      case "string":
        return { icon: Type, label: "Text" };
      case "date":
        return { icon: Calendar, label: "Date" };
      case "number":
      case "integer":
      case "float":
        return { icon: Hash, label: "Number" };
      case "boolean":
        return { icon: ToggleLeft, label: "Boolean" };
      default:
        return { icon: FileText, label: type };
    }
  };

  const formatValue = (value: string | number | boolean | Date | null, type: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">No data found</span>;
    }

    switch (type) {
      case "currency":
        return typeof value === "number" ? `$${value.toFixed(2)}` : value?.toString();
      case "date":
        return value instanceof Date ? value.toLocaleString() : value?.toString();
      case "boolean":
        return value ? "Yes" : "No";
      default:
        if (value instanceof Date) return value.toLocaleString();
        if (typeof value === "boolean") return value ? "Yes" : "No";
        return value?.toString() ?? "";
    }
  };

  const getExtractedValue = (fieldName: string): ExtractedValue | undefined => {
    return extractionResult.fields?.find((f) => f.fieldName === fieldName);
  };

  const getExtractedTable = (tableName: string): ExtractedTable | undefined => {
    return extractionResult.tables?.find((t) => t.tableName === tableName);
  };

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No categories configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => (
        <div key={category.categoryId} className="space-y-4">
          <h3 className="text-lg font-semibold text-primary border-b pb-2">{category.name}</h3>

          {/* Fields */}
          {category.fields.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {category.fields.map((field) => {
                const extractedValue = getExtractedValue(field.name);
                const typeInfo = getFieldTypeInfo(field.type);
                return (
                  <Card key={field.id}>
                    <CardHeader>
                      <CardTitle>
                        {extractedValue?.value ? formatValue(extractedValue.value, field.type) : field.name}
                      </CardTitle>
                      <CardDescription>{field.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="h-5 text-xs">
                          <typeInfo.icon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                        {!extractedValue?.value && (
                          <Badge variant="outline" className="h-5 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            No data
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Tables */}
          {category.tables.length > 0 && (
            <div className="space-y-4">
              {category.tables.map((table) => {
                const extractedTable = getExtractedTable(table.name);
                return (
                  <Card key={table.id}>
                    <CardHeader>
                      <CardTitle>{table.name}</CardTitle>
                      <CardDescription>{table.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {extractedTable?.rows && extractedTable.rows.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {table.columns.map((col) => (
                                  <TableHead key={col.id}>{col.name}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {extractedTable.rows.map((row, rowIndex) => (
                                <TableRow key={`${table.id}-row-${rowIndex}`}>
                                  {table.columns.map((col) => (
                                    <TableCell key={col.id}>{formatValue(row.values[col.name], col.type)}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No table data found</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
