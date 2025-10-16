import type { WorkflowConfiguration } from "@paperjet/db/types";

export const commerceConfig: WorkflowConfiguration = {
  objects: [
    {
      name: "Order Header",
      fields: [
        {
          name: "Order Number",
          description: "Unique order identifier",
          type: "string",
        },
        {
          name: "Order Date",
          description: "Date the order was placed",
          type: "string",
        },
        {
          name: "Customer Name",
          description: "Name of the customer",
          type: "string",
        },
        {
          name: "Customer Address",
          description: "Address of the customer",
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
      ],
    },
    {
      name: "Line Items",
      tables: [
        {
          name: "Order Line Items",
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
      name: "Order Totals",
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
