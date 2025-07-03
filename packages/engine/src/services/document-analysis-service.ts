import { google } from "@ai-sdk/google";
import { type DocumentTypeAndCategories, documentTypeAndCategoriesSchema, type FieldCategoryAnalysis, fieldCategoryAnalysisSchema } from "@paperjet/db/types";
import { logger } from "@paperjet/shared";
import { generateObject } from "ai";
import type { Langfuse } from "langfuse";
import { z } from "zod";

export interface DocumentAnalysisServiceDeps {
    langfuse: Langfuse;
}

export class DocumentAnalysisService {
    constructor(private deps: DocumentAnalysisServiceDeps) {}

    async analyzeDocumentType(presignedUrl: string): Promise<DocumentTypeAndCategories> {
        logger.info({ presignedUrl }, "Starting document type analysis");

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        const prompt = `You're a document analysis expert. Analyze this document and provide:

        1. Document type (invoice, contract, form, purchase order, receipt, bank statement, etc.)

        2. Identify the data categories/group in the document, ex. invoice details, vendor information, billing information, line items, payment terms
        3. Based on the document type and categories, create a 1-2 sentence description for a process that would be used to extract the data from the document.
        Example: "Extracts invoice details, vendor information, billing information, line items and payment terms"
        4. A workflow name for the document type ex. Invoice processor
        `;

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
                schema: documentTypeAndCategoriesSchema,
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

            logger.info(
                {
                    documentType: object.documentType,
                },
                "Document type analysis completed",
            );

            return object as DocumentTypeAndCategories;
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

    async extractFieldsWithCategories(presignedUrl: string, documentType: DocumentTypeAndCategories): Promise<FieldCategoryAnalysis> {
        logger.info(
            {
                documentType: documentType,
            },
            "Starting field extraction with categories",
        );

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");
        const categoryList = documentType.categories.map((c) => `- ${c}`).join("\n");

        const prompt = `Extract singular fields (NOT tables or lists) from this ${documentType.documentType} document and assign each to one of these categories:

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
                categoriesCount: documentType.categories.length,
            },
        });

        const generation = trace.generation({
            name: "extract-fields-with-categories",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                documentType: documentType.documentType,
                categories: documentType.categories,
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

            logger.info(
                {
                    fieldsFound: object.suggestedFields.length,
                    fields: object.suggestedFields.map((f) => f.name),
                },
                "Field extraction with categories completed",
            );

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

    async identifyTables(presignedUrl: string, documentType: DocumentTypeAndCategories): Promise<any[]> {
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
            logger.warn(error, "Table identification failed:");

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
        logger.info({ presignedUrl }, "Starting complete document analysis");

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
            // Step 2 & 3: Field Extraction and Table Identification in parallel
            const [fieldAnalysis, tableAnalysis] = await Promise.all([
                this.extractFieldsWithCategories(presignedUrl, documentTypeAnalysis),
                this.identifyTables(presignedUrl, documentTypeAnalysis),
            ]);

            logger.info(
                {
                    documentType: documentTypeAnalysis.documentType,
                    description: documentTypeAnalysis.description,
                    fieldsCount: fieldAnalysis.suggestedFields.length,
                    tablesCount: tableAnalysis.length,
                },
                "Complete document analysis finished",
            );

            return {
                workflowName: documentTypeAnalysis.workflowName,
                documentType: documentTypeAnalysis.documentType,
                description: documentTypeAnalysis.description,
                suggestedFields: fieldAnalysis.suggestedFields,
                suggestedTables: tableAnalysis,
            };
        } catch (error) {
            parentTrace.update({
                output: error,
            });

            throw error;
        }
    }
}
