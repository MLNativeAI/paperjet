import { z } from "zod";
import type { WorkflowConfiguration } from "../types";

export function buildExtractionSchema(configuration: WorkflowConfiguration) {
  const fieldSchemas: Record<string, any> = {};

  configuration.fields.forEach((field) => {
    switch (field.type) {
      case "number":
        fieldSchemas[field.slug] = z.number().nullable();
        break;
      case "date":
        fieldSchemas[field.slug] = z.string().nullable(); // Date as ISO string
        break;
      case "currency":
        fieldSchemas[field.slug] = z.number().nullable(); // Currency as number
        break;
      case "boolean":
        fieldSchemas[field.slug] = z.boolean().nullable();
        break;
      default:
        fieldSchemas[field.slug] = z.string().nullable();
    }
  });

  const tableSchemas: Record<string, any> = {};

  configuration.tables.forEach((table) => {
    const columnSchemas: Record<string, any> = {};

    table.columns.forEach((col) => {
      switch (col.type) {
        case "number":
          columnSchemas[col.slug] = z.number().nullable();
          break;
        case "date":
          columnSchemas[col.slug] = z.string().nullable();
          break;
        case "currency":
          columnSchemas[col.slug] = z.number().nullable();
          break;
        case "boolean":
          columnSchemas[col.slug] = z.boolean().nullable();
          break;
        default:
          columnSchemas[col.slug] = z.string().nullable();
      }
    });

    tableSchemas[table.slug] = z.array(z.object(columnSchemas));
  });

  return z.object({ ...fieldSchemas, ...tableSchemas });
}
