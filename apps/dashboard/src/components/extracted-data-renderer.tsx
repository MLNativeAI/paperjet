import type { ExtractedDataType } from "@paperjet/engine/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtractedDataField } from "./extracted-data-field";
import { ExtractedDataTable } from "./extracted-data-table";

interface ExtractedDataRendererProps {
  data: ExtractedDataType;
}

export function ExtractedDataRenderer({ data }: ExtractedDataRendererProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data extracted yet</p>
        </CardContent>
      </Card>
    );
  }

  const objectEntries = Object.entries(data);

  if (objectEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Extracted Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No data extracted</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {objectEntries.map(([objectName, objectData]) => {
        const hasFields = objectData.fields && Object.keys(objectData.fields).length > 0;
        const hasTables = objectData.tables && Object.keys(objectData.tables).length > 0;
        const hasContent = hasFields || hasTables;

        if (!hasContent) {
          return null;
        }
        return (
          <Card key={objectName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">{objectName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {hasFields && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">Fields</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {objectData.fields &&
                      Object.entries(objectData.fields).map(([fieldName, fieldValue]) => (
                        <ExtractedDataField key={fieldName} name={fieldName} value={fieldValue} />
                      ))}
                  </div>
                </div>
              )}

              {hasTables && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground">Tables</h4>
                  <div className="space-y-4">
                    {objectData.tables &&
                      Object.entries(objectData.tables).map(([tableName, tableData]) => (
                        <ExtractedDataTable key={tableName} name={tableName} data={tableData} />
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
