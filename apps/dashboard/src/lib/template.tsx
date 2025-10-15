import { Building2, CircleDollarSign, Factory, Hospital } from "lucide-react";

export type WorkflowTemplate = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
};

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  invoice: {
    id: "invoice",
    name: "Invoice",
    icon: <CircleDollarSign />,
    description: "Extract common invoice data",
  },
  medical: {
    id: "medical",
    name: "Lab results",
    icon: <Hospital />,
    description: "Extract a structured list of lab results along with reference values",
  },
  industry: {
    id: "industry",
    name: "Industry",
    icon: <Factory />,
    description: "Extract steel plate information from technical drawings",
  },
  government: {
    id: "government",
    name: "Government ID",
    icon: <Building2 />,
    description: "Extract personal information from government ID's such as Passports and driver licenses",
  },
};
