import { google } from "@ai-sdk/google";
import {
    type CategoryAnalysis,
    categoryAnalysisSchema,
    type DocumentTypeAnalysis,
    documentTypeAnalysisSchema,
    type FieldCategoryAnalysis,
    fieldCategoryAnalysisSchema,
} from "@paperjet/db/types";
import { generateObject } from "ai";
import type { Langfuse } from "langfuse";
import { z } from "zod";

export interface DocumentAnalysisServiceDeps {
    langfuse: Langfuse;
}

export class DocumentAnalysisService {
    constructor(private deps: DocumentAnalysisServiceDeps) {}

    async analyzeDocumentType(presignedUrl: string): Promise<DocumentTypeAnalysis> {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        const prompt = `Analyze this document and provide:
1. Document type (invoice, contract, form, purchase order, receipt, bank statement, etc.)
2. Brief description of the document's purpose and content
3. Main sections or areas you can identify in the document

Be specific about the document type and provide a clear description that will help with further analysis.`;

        // Create a trace for this analysis step
        const trace = this.deps.langfuse.trace({
            name: "document-type-analysis",
            metadata: {
                step: "document_type_analysis",
                model: "gemini-2.5-flash",
            },
        });

        const generation = trace.generation({
            name: "analyze-document-type",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
            },
        });

        try {
            const { object } = await generateObject({
                model,
                schema: documentTypeAnalysisSchema,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt,
                            },
                            {
                                type: "image",
                                image: new URL(presignedUrl),
                            },
                        ],
                    },
                ],
                experimental_telemetry: {
                    isEnabled: true,
                    metadata: {
                        langfuseTraceId: trace.id,
                    },
                },
            });

            generation.end({
                output: object,
            });

            trace.update({
                output: object,
            });

            return object as DocumentTypeAnalysis;
        } catch (error) {
            generation.end({
                output: error,
            });

            trace.update({
                output: error,
            });

            throw error;
        }
    }

    async identifyCategories(presignedUrl: string, documentType: DocumentTypeAnalysis): Promise<CategoryAnalysis> {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        const prompt = `Based on this ${documentType.documentType} document, identify logical categories to group information.

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

Focus on creating categories that make sense for this specific document type.`;

        // Create a trace for this analysis step
        const trace = this.deps.langfuse.trace({
            name: "category-identification",
            metadata: {
                step: "category_identification",
                model: "gemini-2.5-flash",
                documentType: documentType.documentType,
            },
        });

        const generation = trace.generation({
            name: "identify-categories",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                documentType: documentType.documentType,
            },
        });

        try {
            const { object } = await generateObject({
                model,
                schema: categoryAnalysisSchema,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt,
                            },
                            {
                                type: "image",
                                image: new URL(presignedUrl),
                            },
                        ],
                    },
                ],
                experimental_telemetry: {
                    isEnabled: true,
                    metadata: {
                        langfuseTraceId: trace.id,
                    },
                },
            });

            generation.end({
                output: object,
            });

            trace.update({
                output: object,
            });

            return object as CategoryAnalysis;
        } catch (error) {
            generation.end({
                output: error,
            });

            trace.update({
                output: error,
            });

            throw error;
        }
    }

    async extractFieldsWithCategories(
        presignedUrl: string,
        documentType: DocumentTypeAnalysis,
        categories: CategoryAnalysis,
    ): Promise<FieldCategoryAnalysis> {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");
        const categoryList = categories.categories.map((c) => `- ${c.name}: ${c.description}`).join("\n");

        const prompt = `Extract fields from this ${documentType.documentType} document and assign each to one of these categories:

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

Provide practical, commonly needed information extraction focused on business processes.`;

        // Create a trace for this analysis step
        const trace = this.deps.langfuse.trace({
            name: "field-extraction-with-categories",
            metadata: {
                step: "field_extraction",
                model: "gemini-2.5-flash",
                documentType: documentType.documentType,
                categoriesCount: categories.categories.length,
            },
        });

        const generation = trace.generation({
            name: "extract-fields-with-categories",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                documentType: documentType.documentType,
                categories: categories.categories,
            },
        });

        try {
            const { object } = await generateObject({
                model,
                schema: fieldCategoryAnalysisSchema,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt,
                            },
                            {
                                type: "image",
                                image: new URL(presignedUrl),
                            },
                        ],
                    },
                ],
                experimental_telemetry: {
                    isEnabled: true,
                    metadata: {
                        langfuseTraceId: trace.id,
                    },
                },
            });

            generation.end({
                output: object,
            });

            trace.update({
                output: object,
            });

            return object as FieldCategoryAnalysis;
        } catch (error) {
            generation.end({
                output: error,
            });

            trace.update({
                output: error,
            });

            throw error;
        }
    }

    async identifyTables(presignedUrl: string, documentType: DocumentTypeAnalysis): Promise<any[]> {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        const prompt = `Identify any table structures in this ${documentType.documentType} document.

Look for:
- Line items, product lists
- Transaction details
- Itemized lists
- Data grids or structured information

For each table found, provide:
- Table name and description
- Column definitions with names, types, and descriptions
- Focus on business-relevant structured data

If no clear table structures are found, return an empty array.`;

        // Create a trace for this analysis step
        const trace = this.deps.langfuse.trace({
            name: "table-identification",
            metadata: {
                step: "table_identification",
                model: "gemini-2.5-flash",
                documentType: documentType.documentType,
            },
        });

        const generation = trace.generation({
            name: "identify-tables",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                documentType: documentType.documentType,
            },
        });

        try {
            const { object } = await generateObject({
                model,
                schema: z.object({
                    suggestedTables: z.array(
                        z.object({
                            name: z.string(),
                            description: z.string(),
                            columns: z.array(
                                z.object({
                                    name: z.string(),
                                    description: z.string(),
                                    type: z.enum(["text", "number", "date", "currency", "boolean"]),
                                    required: z.boolean().default(false),
                                    category: z.string().default("Table Data"),
                                }),
                            ),
                        }),
                    ),
                }),
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: prompt,
                            },
                            {
                                type: "image",
                                image: new URL(presignedUrl),
                            },
                        ],
                    },
                ],
                experimental_telemetry: {
                    isEnabled: true,
                    metadata: {
                        langfuseTraceId: trace.id,
                    },
                },
            });

            const result = (object as any).suggestedTables || [];

            generation.end({
                output: result,
            });

            trace.update({
                output: result,
            });

            return result;
        } catch (error) {
            console.warn("Table identification failed:", error);

            generation.end({
                output: error,
            });

            trace.update({
                output: error,
            });

            return [];
        }
    }

    async performCompleteAnalysis(presignedUrl: string) {
        const parentTrace = this.deps.langfuse.trace({
            name: "complete-document-analysis",
            metadata: {
                operation: "complete_analysis",
                imageUrl: presignedUrl,
            },
        });

        try {
            // Step 1: Document Type Analysis
            const documentTypeAnalysis = await this.analyzeDocumentType(presignedUrl);

            // Step 2: Category Identification
            const categoryAnalysis = await this.identifyCategories(presignedUrl, documentTypeAnalysis);

            // Step 3: Field Extraction with Categories
            const fieldAnalysis = await this.extractFieldsWithCategories(
                presignedUrl,
                documentTypeAnalysis,
                categoryAnalysis,
            );

            // Step 4: Table Identification
            const tableAnalysis = await this.identifyTables(presignedUrl, documentTypeAnalysis);

            const result = {
                documentType: documentTypeAnalysis.documentType,
                suggestedFields: fieldAnalysis.suggestedFields,
                suggestedTables: tableAnalysis,
            };

            parentTrace.update({
                output: result,
            });

            return result;
        } catch (error) {
            parentTrace.update({
                output: error,
            });

            throw error;
        }
    }
}
