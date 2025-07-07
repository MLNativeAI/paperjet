export function generateId(prefix: string): string {
  const uuid = crypto.randomUUID();
  const shortId = uuid.replace(/-/g, "").substring(0, 12);
  return `${prefix}_${shortId}`;
}

export const ID_PREFIXES = {
  file: "fil",
  workflow: "wkf",
  workflowExecution: "run",
  workflowFile: "wfl",
  WORKFLOW_SAMPLE: "wsp",
  user: "usr",
  session: "ses",
  account: "acc",
  verification: "ver",
  field: "fld",
  table: "tbl",
  column: "col",
} as const;
