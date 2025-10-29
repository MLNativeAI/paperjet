import type { WorkflowConfiguration } from "@paperjet/db/types";

export interface DraftField {
  id: string;
  name: string;
  description?: string;
  type: "string" | "date" | "number";
}

export interface DraftColumn {
  id: string;
  name: string;
  description?: string;
  type: "string" | "date" | "number";
}

export interface DraftTable {
  id: string;
  name: string;
  description?: string;
  columns: DraftColumn[];
}

export interface DraftObject {
  id: string;
  name: string;
  description?: string;
  fields?: DraftField[];
  tables?: DraftTable[];
}

export interface DraftWorkflowConfig {
  objects: DraftObject[];
}

export function fromWorkflowConfig(config: WorkflowConfiguration) {
  const draftObjects: DraftObject[] = config.objects.map((obj) => ({
    id: `draft-${obj.name}-${Date.now()}`, // Generate a unique ID for the draft
    name: obj.name,
    description: obj.description || "",
    fields:
      obj.fields?.map((field) => ({
        id: `field-${field.name}-${Date.now()}`,
        name: field.name,
        description: field.description || "",
        type: field.type as "string" | "date" | "number",
      })) || [],
    tables:
      obj.tables?.map((table) => ({
        id: `table-${table.name}-${Date.now()}`,
        name: table.name,
        description: table.description || "",
        columns: table.columns.map((column) => ({
          id: `column-${column.name}-${Date.now()}`,
          name: column.name,
          description: column.description || "",
          type: column.type as "string" | "date" | "number",
        })),
      })) || [],
  }));
  return draftObjects;
}

export function toWorkflowConfig(config: DraftWorkflowConfig): WorkflowConfiguration {
  return {
    objects: config.objects,
  };
}

export type TrialInfo =
  | {
      onTrial: true;
      trialEnd: Date;
    }
  | {
      onTrial: false;
      trialEnd: undefined;
    };
