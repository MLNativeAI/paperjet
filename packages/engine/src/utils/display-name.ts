/**
 * Converts a snake_case identifier to a human-readable display name
 *
 * @param slug - The snake_case identifier
 * @returns A Title Case display name
 *
 * @example
 * toDisplayName("line_items") // "Line Items"
 * toDisplayName("invoice_number") // "Invoice Number"
 * toDisplayName("total_amount") // "Total Amount"
 */
export function toDisplayName(slug: string): string {
  if (!slug) return "";

  return slug
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Converts a natural language string to a snake_case slug
 *
 * @param displayName - The human-readable display name
 * @returns A snake_case slug
 *
 * @example
 * toSlug("Line Items") // "line_items"
 * toSlug("Invoice Number") // "invoice_number"
 * toSlug("Total Amount!") // "total_amount"
 */
export function toSlug(displayName: string): string {
  if (!displayName) return "";

  return (
    displayName
      .toLowerCase()
      .trim()
      // Replace spaces and multiple whitespace with underscores
      .replace(/\s+/g, "_")
      // Remove any non-alphanumeric characters except underscores
      .replace(/[^a-z0-9_]/g, "")
      // Remove leading/trailing underscores and collapse multiple underscores
      .replace(/^_+|_+$/g, "")
      .replace(/_+/g, "_")
  );
}
