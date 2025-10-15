import type { WorkflowConfiguration } from "@paperjet/db/types";
import { Building2, CircleDollarSign, Factory, Hospital } from "lucide-react";
import { governmentIdConfig } from "@/lib/template/government-id";
import { industryConfig } from "@/lib/template/industry";
import { invoiceConfig } from "@/lib/template/invoice";
import { labResultsConfig } from "@/lib/template/lab-results";

export type WorkflowTemplate = {
  id: string;
  name: string;
  icon: React.ReactNode;
  config: WorkflowConfiguration;
  description: string;
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
    description: "Extract common invoice data",
    config: invoiceConfig,
  },
  medical: {
    id: "medical",
    name: "Lab results",
    icon: <Hospital />,
    description: "Extract a structured list of lab results along with reference values",
    config: labResultsConfig,
  },
  industry: {
    id: "industry",
    name: "Industry",
    icon: <Factory />,
    description: "Extract steel plate information from technical drawings",
    config: industryConfig,
  },
  government: {
    id: "government",
    name: "Government ID",
    icon: <Building2 />,
    description: "Extract personal information from government ID's such as Passports and driver licenses",
    config: governmentIdConfig,
  },
};
