import type { WorkflowConfiguration } from "@paperjet/db/types";

export const invoiceConfig: WorkflowConfiguration = {
  objects: [
    {
      name: "Invoice Header",
      fields: [
        {
          name: "Invoice Number",
          description: "Unique invoice identifier",
          type: "string",
        },
        {
          name: "Invoice Date",
          description: "Date the invoice was issued",
          type: "string",
        },
        {
          name: "Due Date",
          description: "Payment due date",
          type: "string",
        },
        {
          name: "Vendor Name",
          description: "Name of the vendor or seller",
          type: "string",
        },
        {
          name: "Vendor Address",
          description: "Address of the vendor",
          type: "string",
        },
        {
          name: "Customer Name",
          description: "Name of the customer or buyer",
          type: "string",
        },
        {
          name: "Customer Address",
          description: "Address of the customer",
          type: "string",
        },
        {
          name: "Invoice Currency",
          type: "string",
          description: "3-letter currency code",
        },
      ],
    },
    {
      name: "Line Items",
      tables: [
        {
          name: "Invoice Line Items",
          columns: [
            {
              name: "Description",
              type: "string",
            },
            {
              name: "Quantity",
              type: "number",
            },
            {
              name: "Unit Price",
              type: "number",
            },
            {
              name: "Total",
              type: "number",
            },
          ],
        },
      ],
    },
    {
      name: "Invoice Totals",
      fields: [
        {
          name: "Subtotal",
          description: "Total before taxes",
          type: "number",
        },
        {
          name: "Tax Amount",
          description: "Total tax amount",
          type: "number",
        },
        {
          name: "Total Amount",
          description: "Final total amount due",
          type: "number",
        },
      ],
    },
  ],
};
