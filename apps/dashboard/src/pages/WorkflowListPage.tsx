import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Receipt,
  FileSpreadsheet,
  ScrollText,
  DollarSign,
  Package,
  Plus,
} from "lucide-react";

const workflowTemplates = [
  {
    id: "invoice",
    name: "Invoice Processing",
    description:
      "Extract vendor, amounts, line items, and payment details from invoices",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    id: "receipt",
    name: "Receipt Scanning",
    description:
      "Capture merchant, date, total, and itemized purchases from receipts",
    icon: Receipt,
    color: "text-green-600",
  },
  {
    id: "purchase-order",
    name: "Purchase Orders",
    description:
      "Extract PO numbers, items, quantities, and delivery information",
    icon: Package,
    color: "text-purple-600",
  },
  {
    id: "bank-statement",
    name: "Bank Statements",
    description:
      "Process transactions, balances, and account details from statements",
    icon: DollarSign,
    color: "text-orange-600",
  },
  {
    id: "contract",
    name: "Contracts & Agreements",
    description:
      "Extract parties, terms, dates, and key clauses from legal documents",
    icon: ScrollText,
    color: "text-red-600",
  },
  {
    id: "tax-form",
    name: "Tax Forms",
    description:
      "Process W-2s, 1099s, and other tax documents for key data points",
    icon: FileSpreadsheet,
    color: "text-indigo-600",
  },
];

export default function WorkflowListPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-8">
          What would you like to process today?
        </h1>
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => navigate({ to: "/workflows/new" })}
        >
          <Plus className="h-5 w-5" />
          Create New Workflow
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Choose from a template
          </h2>
          <p className="text-muted-foreground mb-6">
            Start with a pre-built workflow for common document types
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-gray-50 ${template.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
