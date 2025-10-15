import type { WorkflowConfiguration } from "@paperjet/db/types";

export const bankStatementConfig: WorkflowConfiguration = {
  objects: [
    {
      name: "Account Information",
      fields: [
        {
          name: "Account Holder Name",
          description: "Name of the account holder",
          type: "string",
        },
        {
          name: "Account Number",
          description: "Bank account number",
          type: "string",
        },
        {
          name: "Bank Name",
          description: "Name of the bank",
          type: "string",
        },
        {
          name: "Statement Period",
          description: "Period covered by the statement",
          type: "string",
        },
        {
          name: "Opening Balance",
          description: "Balance at the start of the period",
          type: "number",
        },
        {
          name: "Closing Balance",
          description: "Balance at the end of the period",
          type: "number",
        },
      ],
    },
    {
      name: "Transactions",
      tables: [
        {
          name: "Transaction History",
          columns: [
            {
              name: "Date",
              type: "string",
            },
            {
              name: "Description",
              type: "string",
            },
            {
              name: "Amount",
              type: "number",
            },
            {
              name: "Balance",
              type: "number",
            },
          ],
        },
      ],
    },
  ],
};
