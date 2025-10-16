import type { WorkflowConfiguration } from "@paperjet/db/types";

export const governmentIdConfig: WorkflowConfiguration = {
  objects: [
    {
      name: "Personal Information",
      fields: [
        {
          name: "Full Name",
          description: "Full name of the individual",
          type: "string",
        },
        {
          name: "Date of Birth",
          description: "Date of birth",
          type: "string",
        },
        {
          name: "ID Number",
          description: "Government ID number",
          type: "string",
        },
        {
          name: "Issue Date",
          description: "Date the ID was issued",
          type: "string",
        },
        {
          name: "Expiry Date",
          description: "Date the ID expires",
          type: "string",
        },
        {
          name: "Place of Birth",
          description: "Place of birth",
          type: "string",
        },
        {
          name: "Gender",
          description: "Gender",
          type: "string",
        },
      ],
    },
  ],
};
