import type { WorkflowConfiguration } from "@paperjet/db/types";
import { z } from "zod";

export function buildExtractionSchema(configuration: WorkflowConfiguration) {
  const objectSchemas: Record<string, any> = {};

  configuration.objects.forEach((obj) => {
    const objectProperties: Record<string, any> = {};

    if ("fields" in obj) {
      const fieldsSchema: Record<string, any> = {};

      obj.fields?.forEach((field) => {
        switch (field.type) {
          case "number":
            fieldsSchema[field.name] = z.number().nullable().optional();
            break;
          case "date":
            fieldsSchema[field.name] = z.string().nullable().optional(); // Date as ISO string
            break;
          default:
            fieldsSchema[field.name] = z.string().nullable().optional();
        }
      });

      objectProperties.fields = z.object(fieldsSchema).optional();
    }

    if ("tables" in obj) {
      const tablesSchema: Record<string, any> = {};

      obj.tables?.forEach((table) => {
        const columnSchemas: Record<string, any> = {};

        table.columns.forEach((col) => {
          switch (col.type) {
            case "number":
              columnSchemas[col.name] = z.number().nullable().optional();
              break;
            case "date":
              columnSchemas[col.name] = z.string().nullable().optional();
              break;
            default:
              columnSchemas[col.name] = z.string().nullable().optional();
          }
        });

        tablesSchema[table.name] = z.array(z.object(columnSchemas)).optional();
      });

      objectProperties.tables = z.object(tablesSchema).optional();
    }

    let schema = z.object(objectProperties);
    if (obj.description) {
      schema = schema.describe(obj.description);
    }
    objectSchemas[obj.name] = schema.optional();
  });

  return z.object(objectSchemas);
}
