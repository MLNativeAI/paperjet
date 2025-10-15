import type { RuntimeModelType, WorkflowConfiguration } from "@paperjet/db/types";
import { Building2, CircleDollarSign, Factory, Hospital, Landmark, ShoppingCart } from "lucide-react";
import { commerceConfig } from "@/lib/template/commerce";
import { governmentIdConfig } from "@/lib/template/government-id";
import { invoiceConfig } from "@/lib/template/invoice";
import { labResultsConfig } from "@/lib/template/lab-results";
import { bankStatementConfig } from "@/lib/template/bank-statement";

export type WorkflowTemplate = {
  id: string;
  name: string;
  icon: React.ReactNode;
  config: WorkflowConfiguration;
  description: string;
  modelType: RuntimeModelType;
};

export function getTemplateForId(templateId: string) {
  const template = WORKFLOW_TEMPLATES[templateId];
  return template;
}

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  invoice: {
    id: "invoice",
    name: "Invoice",
    icon: <CircleDollarSign />,
    description: "Extract invoice line items, monetary and tax values and buyer/seller details",
    config: invoiceConfig,
    modelType: "accurate",
  },
  medical: {
    id: "medical",
    name: "Lab results",
    icon: <Hospital />,
    description: "Extract a structured list of lab results along with reference values",
    config: labResultsConfig,
    modelType: "accurate",
  },
  commerce: {
    id: "commerce",
    name: "Commerce",
    icon: <ShoppingCart />,
    description: "Extract line items from order documents",
    config: commerceConfig,
    modelType: "accurate",
  },
  government: {
    id: "government",
    name: "Government ID",
    icon: <Building2 />,
    description: "Extract personal information from government ID's such as Passports and driver licenses",
    config: governmentIdConfig,
    modelType: "accurate",
  },
  bank_statement: {
    id: "bank_statement",
    name: "Bank Statement",
    icon: <Landmark />,
    description: "Extracts a list of transactions, account owner and bank details",
    config: bankStatementConfig,
    modelType: "accurate",
  },
};
