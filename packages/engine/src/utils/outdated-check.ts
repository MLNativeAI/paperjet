import type {
  FieldsConfiguration,
  TableConfiguration,
  Workflow,
} from "../types";

/**
 * Check if a field was modified after the sample data was extracted
 */
export function isFieldOutdated(
  field: FieldsConfiguration[number],
  sampleDataExtractedAt: Date | null | undefined,
): boolean {
  if (!sampleDataExtractedAt) {
    // If no extraction date, consider it outdated
    return true;
  }

  if (!field.lastModified) {
    // If field has never been modified, it's not outdated
    return false;
  }

  return new Date(field.lastModified) > new Date(sampleDataExtractedAt);
}

/**
 * Check if a table was modified after the sample data was extracted
 */
export function isTableOutdated(
  table: TableConfiguration[number],
  sampleDataExtractedAt: Date | null | undefined,
): boolean {
  if (!sampleDataExtractedAt) {
    // If no extraction date, consider it outdated
    return true;
  }

  if (!table.lastModified) {
    // If table has never been modified, it's not outdated
    return false;
  }

  return new Date(table.lastModified) > new Date(sampleDataExtractedAt);
}

/**
 * Check if any field or table in the workflow is outdated
 */
export function isWorkflowOutdated(workflow: Workflow): boolean {
  const { configuration, sampleDataExtractedAt } = workflow;

  // Check if any field is outdated
  const hasOutdatedField = configuration.fields.some((field) =>
    isFieldOutdated(field, sampleDataExtractedAt),
  );

  if (hasOutdatedField) {
    return true;
  }

  // Check if any table is outdated
  const hasOutdatedTable = configuration.tables.some((table) =>
    isTableOutdated(table, sampleDataExtractedAt),
  );

  return hasOutdatedTable;
}

/**
 * Get count of outdated fields in a workflow
 */
export function getOutdatedFieldCount(workflow: Workflow): number {
  const { configuration, sampleDataExtractedAt } = workflow;

  return configuration.fields.filter((field) =>
    isFieldOutdated(field, sampleDataExtractedAt),
  ).length;
}

/**
 * Get count of outdated tables in a workflow
 */
export function getOutdatedTableCount(workflow: Workflow): number {
  const { configuration, sampleDataExtractedAt } = workflow;

  return configuration.tables.filter((table) =>
    isTableOutdated(table, sampleDataExtractedAt),
  ).length;
}
