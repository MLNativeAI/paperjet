import { describe, expect, test } from "bun:test";
import { toDisplayName, toSlug } from "../src/utils/display-name";

describe("toDisplayName", () => {
  test("converts basic snake_case to Title Case", () => {
    expect(toDisplayName("line_items")).toBe("Line Items");
    expect(toDisplayName("invoice_number")).toBe("Invoice Number");
    expect(toDisplayName("total_amount")).toBe("Total Amount");
  });

  test("handles single words", () => {
    expect(toDisplayName("invoice")).toBe("Invoice");
    expect(toDisplayName("total")).toBe("Total");
  });

  test("handles edge cases", () => {
    expect(toDisplayName("")).toBe("");
    expect(toDisplayName("a")).toBe("A");
    expect(toDisplayName("a_b")).toBe("A B");
  });

  test("handles multiple underscores", () => {
    expect(toDisplayName("line__items")).toBe("Line  Items");
    expect(toDisplayName("a___b___c")).toBe("A   B   C");
  });

  test("handles mixed case input", () => {
    expect(toDisplayName("LINE_ITEMS")).toBe("Line Items");
    expect(toDisplayName("Invoice_Number")).toBe("Invoice Number");
  });
});

describe("toSlug", () => {
  test("converts basic Title Case to snake_case", () => {
    expect(toSlug("Line Items")).toBe("line_items");
    expect(toSlug("Invoice Number")).toBe("invoice_number");
    expect(toSlug("Total Amount")).toBe("total_amount");
  });

  test("handles single words", () => {
    expect(toSlug("Invoice")).toBe("invoice");
    expect(toSlug("Total")).toBe("total");
  });

  test("removes special characters", () => {
    expect(toSlug("Total Amount!")).toBe("total_amount");
    expect(toSlug("Line Items @#$")).toBe("line_items");
    expect(toSlug("Invoice & Number")).toBe("invoice_number");
  });

  test("handles multiple spaces", () => {
    expect(toSlug("Line   Items")).toBe("line_items");
    expect(toSlug("  Invoice  Number  ")).toBe("invoice_number");
  });

  test("handles edge cases", () => {
    expect(toSlug("")).toBe("");
    expect(toSlug("   ")).toBe("");
    expect(toSlug("A")).toBe("a");
    expect(toSlug("A B")).toBe("a_b");
  });

  test("preserves numbers", () => {
    expect(toSlug("Item 123")).toBe("item_123");
    expect(toSlug("Address Line 2")).toBe("address_line_2");
  });

  test("handles already snake_case input", () => {
    expect(toSlug("line_items")).toBe("line_items");
    expect(toSlug("invoice_number")).toBe("invoice_number");
  });

  test("collapses multiple underscores", () => {
    expect(toSlug("Line___Items")).toBe("line_items");
    expect(toSlug("___Invoice___Number___")).toBe("invoice_number");
  });
});

describe("bidirectional conversion", () => {
  test("toDisplayName and toSlug are reversible for standard cases", () => {
    const testCases = [
      "line_items",
      "invoice_number", 
      "total_amount",
      "customer_name",
      "due_date"
    ];

    testCases.forEach(slug => {
      const displayName = toDisplayName(slug);
      const backToSlug = toSlug(displayName);
      expect(backToSlug).toBe(slug);
    });
  });

  test("toSlug and toDisplayName are reversible for standard cases", () => {
    const testCases = [
      "Line Items",
      "Invoice Number",
      "Total Amount", 
      "Customer Name",
      "Due Date"
    ];

    testCases.forEach(displayName => {
      const slug = toSlug(displayName);
      const backToDisplayName = toDisplayName(slug);
      expect(backToDisplayName).toBe(displayName);
    });
  });

  test("handles complex cases with special characters", () => {
    // These won't be perfectly reversible due to special character removal
    expect(toSlug("Total Amount!")).toBe("total_amount");
    expect(toDisplayName(toSlug("Total Amount!"))).toBe("Total Amount");
    
    expect(toSlug("Line Items @#$")).toBe("line_items");
    expect(toDisplayName(toSlug("Line Items @#$"))).toBe("Line Items");
  });
});