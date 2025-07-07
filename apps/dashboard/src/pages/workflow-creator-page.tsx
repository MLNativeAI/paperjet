import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, DollarSign, FileSpreadsheet, FileText, Package, Receipt, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkflowUploadSection from "@/components/workflow/workflow-upload-section";
import { WorkflowTemplateCard } from "@/components/workflow-template-card";

const workflowTemplates = [
  {
    id: "invoice",
    name: "Invoice Processing",
    description: "Extract vendor, amounts, line items, and payment details from invoices",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    id: "receipt",
    name: "Receipt Scanning",
    description: "Capture merchant, date, total, and itemized purchases from receipts",
    icon: Receipt,
    color: "text-green-600",
  },
  {
    id: "purchase-order",
    name: "Purchase Orders",
    description: "Extract PO numbers, items, quantities, and delivery information",
    icon: Package,
    color: "text-purple-600",
  },
  {
    id: "bank-statement",
    name: "Bank Statements",
    description: "Process transactions, balances, and account details from statements",
    icon: DollarSign,
    color: "text-orange-600",
  },
  {
    id: "contract",
    name: "Contracts & Agreements",
    description: "Extract parties, terms, dates, and key clauses from legal documents",
    icon: ScrollText,
    color: "text-red-600",
  },
  {
    id: "tax-form",
    name: "Tax Forms",
    description: "Process W-2s, 1099s, and other tax documents for key data points",
    icon: FileSpreadsheet,
    color: "text-indigo-600",
  },
];

export default function WorkflowCreatorPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Create New Workflow</h1>
        <p className="text-muted-foreground">
          Choose a template to get started or create a custom workflow from scratch
        </p>
      </div>

      <div className="space-y-8">
        {/* Custom Workflow Option */}
        <WorkflowUploadSection />

        {/* Template Selection */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">...or choose from a template</h2>
          <p className="text-muted-foreground mb-6">Start with a pre-built workflow for common document types</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.map((template) => (
              <WorkflowTemplateCard key={template.id} template={template} onClick={() => {}} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workflows
        </Button>
      </div>
    </div>
  );
}
