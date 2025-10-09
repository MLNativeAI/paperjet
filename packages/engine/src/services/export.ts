import type { ExtractedDataType } from "@paperjet/db/types";

export interface ExportResult {
  content: string;
  contentType: string;
  filename: string;
}

export async function exportData(
  data: ExtractedDataType,
  mode: "json" | "csv",
  executionId: string,
): Promise<ExportResult> {
  const timestamp = new Date().toISOString().split("T")[0]?.replace(/-/g, "");
  const baseFilename = `${executionId}_${timestamp}`;

  if (mode === "json") {
    return {
      content: JSON.stringify(data, null, 2),
      contentType: "application/json",
      filename: `${baseFilename}.json`,
    };
  }

  const csvRows: string[] = [];

  if (!data) {
    return {
      content: "No data available",
      contentType: "text/csv",
      filename: `${baseFilename}.csv`,
    };
  }

  for (const [objectName, objectData] of Object.entries(data)) {
    csvRows.push(`\n[${objectName}]`);

    if (objectData.fields && Object.keys(objectData.fields).length > 0) {
      csvRows.push("\nFields:");
      csvRows.push("Field Name,Value");
      for (const [fieldName, fieldValue] of Object.entries(objectData.fields)) {
        const value = fieldValue !== null ? String(fieldValue) : "";
        // Escape quotes and wrap in quotes if contains comma
        const escapedValue = value.includes(",") || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
        csvRows.push(`${fieldName},${escapedValue}`);
      }
    }

    if (objectData.tables) {
      for (const [tableName, tableRows] of Object.entries(objectData.tables)) {
        if (tableRows.length > 0) {
          csvRows.push(`\nTable: ${tableName}`);

          // Get all unique column names
          const columns = new Set<string>();
          for (const row of tableRows) {
            for (const col of Object.keys(row)) {
              columns.add(col);
            }
          }
          const columnArray = Array.from(columns);

          csvRows.push(columnArray.join(","));

          for (const row of tableRows) {
            const rowValues = columnArray.map((col) => {
              const value = row[col];
              const stringValue = value !== null && value !== undefined ? String(value) : "";
              // Escape quotes and wrap in quotes if contains comma
              return stringValue.includes(",") || stringValue.includes('"')
                ? `"${stringValue.replace(/"/g, '""')}"`
                : stringValue;
            });
            csvRows.push(rowValues.join(","));
          }
        }
      }
    }
  }

  return {
    content: csvRows.join("\n"),
    contentType: "text/csv",
    filename: `${baseFilename}.csv`,
  };
}
