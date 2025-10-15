import type { WorkflowConfiguration } from "@paperjet/db/types";

export const invoiceConfig: WorkflowConfiguration = {
  objects: [
    {
      name: "Personal Data",
      fields: [
        {
          name: "Name",
          description: "Full name of the individual",
          type: "string",
        },
        {
          name: "Date of birth",
          description: "Full date of birth",
          type: "string",
        },
        {
          name: "PESEL",
          type: "number",
        },
        {
          name: "Age",
          type: "number",
        },
        {
          name: "Gender",
          type: "string",
        },
      ],
    },
    {
      name: "Blood results",
      tables: [
        {
          name: "Blood results table",
          columns: [
            {
              name: "Test name",
              type: "string",
            },
            {
              name: "Value",
              type: "number",
            },
            {
              name: "Unit",
              type: "string",
            },
            {
              name: "Reference range",
              type: "string",
            },
          ],
        },
      ],
    },
    {
      name: "Biochemistry results",
      tables: [
        {
          name: "Biochemistry",
          columns: [
            {
              name: "Test name",
              type: "string",
            },
            {
              name: "Value",
              type: "number",
            },
            {
              name: "Unit",
              type: "string",
            },
            {
              name: "Reference range",
              type: "string",
            },
          ],
        },
      ],
    },
    {
      name: "Urine results",
      tables: [
        {
          name: "Urine",
          columns: [
            {
              name: "Test name",
              type: "string",
            },
            {
              name: "Result",
              type: "string",
            },
            {
              name: "Reference range",
              type: "string",
            },
          ],
        },
      ],
    },
  ],
};
