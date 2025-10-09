import { WorkflowConfiguration } from "@paperjet/db/types";

export const energyConfig: WorkflowConfiguration = {
  objects: [
    {
      name: "Seller details",
      fields: [
        {
          name: "Seller name",
          type: "string",
        },
        {
          name: "Seller address",
          type: "string",
        },
        {
          name: "Seller NIP",
          type: "string",
        },
      ],
    },
    {
      name: "Buyer details",
      fields: [
        {
          name: "Buyer name",
          type: "string",
        },
        {
          name: "Buyer address",
          type: "string",
        },
        {
          name: "Buyer NIP",
          type: "string",
        },
        {
          name: "Customer number",
          type: "string",
        },
      ],
    },
    {
      name: "Invoice Data",
      fields: [
        {
          name: "Invoice Number",
          type: "string",
        },
        {
          name: "Billing period start",
          type: "date",
        },
        {
          name: "Billing period end",
          type: "date",
        },
        {
          name: "PPE Number",
          type: "string",
        },
        {
          name: "Total amount",
          type: "number",
        },
        {
          name: "Invoice Currency",
          type: "string",
          description: "3-letter currency code",
        },
        {
          name: "Invoice due date",
          type: "date",
        },
        {
          name: "Invoice issue date",
          type: "date",
        },
      ],
    },
    {
      name: "Energy usage data",
      fields: [
        {
          name: "Period from",
          type: "date",
        },
        {
          name: "Period to",
          type: "date",
        },
        {
          name: "Total MWh",
          type: "number",
        },
        {
          name: "Należność",
          type: "number",
        },
        {
          name: "Średnia cenna netto",
          type: "string",
        },
      ],
      tables: [
        {
          name: "Energia czynna",
          description: "Extract only rows that match this category",
          columns: [
            {
              name: "Nazwa towaru lub usługi",
              type: "string",
            },
            {
              name: "Współczynnik",
              type: "string",
            },
            {
              name: "Ilość / Zużycie",
              type: "string",
            },
            {
              name: "Jedn. Miary",
              type: "string",
            },
            {
              name: "Stawka VAT",
              type: "number",
            },
            {
              name: "Cena jedn. netto",
              type: "number",
            },
            {
              name: "Wartość netto",
              type: "number",
            },
          ],
        },
      ],
    },
  ],
};
