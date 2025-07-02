import type { Langfuse } from "langfuse";

export interface PromptManagementServiceDeps {
    langfuse: Langfuse;
}

export interface CompiledPrompt {
    prompt: string;
    metadata: Record<string, unknown>;
    version?: string;
}

export class PromptManagementService {
    constructor(private deps: PromptManagementServiceDeps) {}

    async getDocumentTypeAnalysisPrompt(): Promise<CompiledPrompt> {
        try {
            const prompt = await this.deps.langfuse.getPrompt("document-type-analysis");
            return {
                prompt: prompt.prompt as string,
                metadata: prompt.toJSON(),
                version: prompt.version?.toString(),
            };
        } catch (error) {
            // Fallback to static prompt if Langfuse is not available
            console.warn("Failed to fetch prompt from Langfuse, using fallback:", error);
            return {
                prompt: `Analyze this document and provide:
1. Document type (invoice, contract, form, purchase order, receipt, bank statement, etc.)
2. Brief description of the document's purpose and content
3. Main sections or areas you can identify in the document

Be specific about the document type and provide a clear description that will help with further analysis.`,
                metadata: { source: "fallback" },
            };
        }
    }

    async getCategoryIdentificationPrompt(documentType: string): Promise<CompiledPrompt> {
        try {
            const prompt = await this.deps.langfuse.getPrompt("category-identification");
            const compiledPrompt = prompt.compile({ documentType });
            return {
                prompt: compiledPrompt,
                metadata: prompt.toJSON(),
                version: prompt.version?.toString(),
            };
        } catch (error) {
            console.warn("Failed to fetch prompt from Langfuse, using fallback:", error);
            return {
                prompt: `Based on this ${documentType} document, identify logical categories to group information.

Create 3-8 meaningful category names that represent different types of information in this document type.
For each category, provide a brief description of what information it should contain.

Categories should be:
- Logically distinct
- Comprehensive (covering all important information)
- Business-relevant
- Easy to understand

Examples for different document types:
- Invoice: "Invoice Details", "Vendor Information", "Billing Information", "Line Items", "Payment Terms"
- Contract: "Party Information", "Agreement Terms", "Dates and Duration", "Financial Terms", "Signatures"
- Purchase Order: "Order Information", "Supplier Details", "Product Items", "Delivery Information", "Terms and Conditions"

Focus on creating categories that make sense for this specific document type.`,
                metadata: { source: "fallback" },
            };
        }
    }

    async getFieldExtractionPrompt(
        documentType: string,
        categories: Array<{ name: string; description: string }>,
    ): Promise<CompiledPrompt> {
        try {
            const prompt = await this.deps.langfuse.getPrompt("field-extraction");
            const categoryList = categories.map((c) => `- ${c.name}: ${c.description}`).join("\n");
            const compiledPrompt = prompt.compile({ documentType, categoryList });
            return {
                prompt: compiledPrompt,
                metadata: prompt.toJSON(),
                version: prompt.version?.toString(),
            };
        } catch (error) {
            console.warn("Failed to fetch prompt from Langfuse, using fallback:", error);
            const categoryList = categories.map((c) => `- ${c.name}: ${c.description}`).join("\n");
            return {
                prompt: `Extract fields from this ${documentType} document and assign each to one of these categories:

${categoryList}

For each field, provide:
- A clear, descriptive name (e.g., "invoice_number", "total_amount", "customer_name")
- The expected data type (text, number, date, currency, boolean)
- A detailed description that serves as instructions for AI extraction, including common label variations and formatting patterns
- The assigned category from the list above

Focus on extracting:
1. **Identification fields**: Document numbers, IDs, reference codes
2. **Key entities**: Names, addresses, contact information
3. **Important dates**: Creation dates, due dates, effective dates
4. **Financial information**: Amounts, taxes, totals, currency values
5. **Status indicators**: Approval status, document state, flags

Examples of good field descriptions:
- "invoice_number": "The unique identifier for this invoice, often labeled as 'Invoice #', 'Invoice Number', 'Document Number', or similar, typically alphanumeric"
- "total_amount": "The final total amount due, usually labeled as 'Total', 'Amount Due', 'Grand Total', or 'Total Amount', excluding currency symbols"
- "invoice_date": "The date when the invoice was created or issued, typically labeled as 'Invoice Date', 'Date', or 'Issued' in MM/DD/YYYY or similar format"

Provide practical, commonly needed information extraction focused on business processes.`,
                metadata: { source: "fallback" },
            };
        }
    }

    async getTableIdentificationPrompt(documentType: string): Promise<CompiledPrompt> {
        try {
            const prompt = await this.deps.langfuse.getPrompt("table-identification");
            const compiledPrompt = prompt.compile({ documentType });
            return {
                prompt: compiledPrompt,
                metadata: prompt.toJSON(),
                version: prompt.version?.toString(),
            };
        } catch (error) {
            console.warn("Failed to fetch prompt from Langfuse, using fallback:", error);
            return {
                prompt: `Identify any table structures in this ${documentType} document.

Look for:
- Line items, product lists
- Transaction details
- Itemized lists
- Data grids or structured information

For each table found, provide:
- Table name and description
- Column definitions with names, types, and descriptions
- Focus on business-relevant structured data

If no clear table structures are found, return an empty array.`,
                metadata: { source: "fallback" },
            };
        }
    }

    async getDataExtractionPrompt(fieldDescriptions: string, tableDescriptions?: string): Promise<CompiledPrompt> {
        try {
            const prompt = await this.deps.langfuse.getPrompt("data-extraction");
            const compiledPrompt = prompt.compile({ fieldDescriptions, tableDescriptions });
            return {
                prompt: compiledPrompt,
                metadata: prompt.toJSON(),
                version: prompt.version?.toString(),
            };
        } catch (error) {
            console.warn("Failed to fetch prompt from Langfuse, using fallback:", error);
            return {
                prompt: `Extract the following information from this document:

FIELDS TO EXTRACT:
${fieldDescriptions}

${tableDescriptions ? `TABLES TO EXTRACT:\n${tableDescriptions}` : ""}

Instructions:
- Extract exact values as they appear in the document
- For currency fields, extract as numbers (remove currency symbols)
- For date fields, use ISO format (YYYY-MM-DD)
- For boolean fields, return true/false based on presence or checkmarks
- If a field is not found or unclear, return null
- For tables, extract all rows found
- Maintain data accuracy and completeness`,
                metadata: { source: "fallback" },
            };
        }
    }

    async createPromptIfNotExists(
        name: string,
        prompt: string,
        type: "text" | "chat" = "text",
        labels: string[] = ["production"],
    ): Promise<void> {
        try {
            await this.deps.langfuse.createPrompt({
                name,
                prompt,
                type,
                labels,
            });
        } catch (error) {
            // Prompt might already exist, which is fine
            console.log(`Prompt ${name} may already exist:`, error);
        }
    }

    async initializeDefaultPrompts(): Promise<void> {
        const prompts = [
            {
                name: "document-type-analysis",
                prompt: `Analyze this document and provide:
1. Document type (invoice, contract, form, purchase order, receipt, bank statement, etc.)
2. Brief description of the document's purpose and content
3. Main sections or areas you can identify in the document

Be specific about the document type and provide a clear description that will help with further analysis.`,
            },
            {
                name: "category-identification",
                prompt: `Based on this {{documentType}} document, identify logical categories to group information.

Create 3-8 meaningful category names that represent different types of information in this document type.
For each category, provide a brief description of what information it should contain.

Categories should be:
- Logically distinct
- Comprehensive (covering all important information)
- Business-relevant
- Easy to understand

Examples for different document types:
- Invoice: "Invoice Details", "Vendor Information", "Billing Information", "Line Items", "Payment Terms"
- Contract: "Party Information", "Agreement Terms", "Dates and Duration", "Financial Terms", "Signatures"
- Purchase Order: "Order Information", "Supplier Details", "Product Items", "Delivery Information", "Terms and Conditions"

Focus on creating categories that make sense for this specific document type.`,
            },
            {
                name: "field-extraction",
                prompt: `Extract fields from this {{documentType}} document and assign each to one of these categories:

{{categoryList}}

For each field, provide:
- A clear, descriptive name (e.g., "invoice_number", "total_amount", "customer_name")
- The expected data type (text, number, date, currency, boolean)
- A detailed description that serves as instructions for AI extraction, including common label variations and formatting patterns
- The assigned category from the list above

Focus on extracting:
1. **Identification fields**: Document numbers, IDs, reference codes
2. **Key entities**: Names, addresses, contact information
3. **Important dates**: Creation dates, due dates, effective dates
4. **Financial information**: Amounts, taxes, totals, currency values
5. **Status indicators**: Approval status, document state, flags

Examples of good field descriptions:
- "invoice_number": "The unique identifier for this invoice, often labeled as 'Invoice #', 'Invoice Number', 'Document Number', or similar, typically alphanumeric"
- "total_amount": "The final total amount due, usually labeled as 'Total', 'Amount Due', 'Grand Total', or 'Total Amount', excluding currency symbols"
- "invoice_date": "The date when the invoice was created or issued, typically labeled as 'Invoice Date', 'Date', or 'Issued' in MM/DD/YYYY or similar format"

Provide practical, commonly needed information extraction focused on business processes.`,
            },
            {
                name: "table-identification",
                prompt: `Identify any table structures in this {{documentType}} document.

Look for:
- Line items, product lists
- Transaction details
- Itemized lists
- Data grids or structured information

For each table found, provide:
- Table name and description
- Column definitions with names, types, and descriptions
- Focus on business-relevant structured data

If no clear table structures are found, return an empty array.`,
            },
            {
                name: "data-extraction",
                prompt: `Extract the following information from this document:

FIELDS TO EXTRACT:
{{fieldDescriptions}}

{{#if tableDescriptions}}TABLES TO EXTRACT:
{{tableDescriptions}}{{/if}}

Instructions:
- Extract exact values as they appear in the document
- For currency fields, extract as numbers (remove currency symbols)
- For date fields, use ISO format (YYYY-MM-DD)
- For boolean fields, return true/false based on presence or checkmarks
- If a field is not found or unclear, return null
- For tables, extract all rows found
- Maintain data accuracy and completeness`,
            },
        ];

        for (const prompt of prompts) {
            await this.createPromptIfNotExists(prompt.name, prompt.prompt);
        }
    }
}
