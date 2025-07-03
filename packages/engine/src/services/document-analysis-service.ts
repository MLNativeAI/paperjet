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

    async extractCategoriesAndTables(presignedUrl: string, documentType: string): Promise<{ categories: { slug: string; displayName: string }[]; tables: { name: string; description: string; category: { slug: string; displayName: string } }[] }> {
        logger.info({ presignedUrl, documentType }, "Starting categories and tables extraction");

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        const prompt = `Analyze this ${documentType} document and extract:

1. **Data Categories**: Identify logical groupings of information in the document (e.g., "Invoice Details", "Vendor Information", "Billing Information", "Line Items", "Payment Terms")

2. **Table Structures**: Identify any tabular data like line items, product lists, transaction details, or data grids

For each category, provide:
- slug: snake_case version (e.g., "invoice_details", "vendor_information", "billing_information")
- displayName: Human-readable format (e.g., "Invoice Details", "Vendor Information", "Billing Information")

For each table, provide:
- name: Descriptive table name
- description: What the table contains
- category: Which category this table belongs to (both slug and displayName)

Focus on business-relevant data structures and logical information groupings.`;

        // Create a trace for this analysis step
        const trace = this.deps.langfuse.trace({
            name: "categories-and-tables-extraction",
            metadata: {
                step: "categories_and_tables_extraction",
                model: "gemini-2.5-flash",
                documentType,
            },
        });

        const generation = trace.generation({
            name: "extract-categories-and-tables",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                documentType,
            },
        });

        try {
            const { object } = await generateObject({
                model,
                schema: z.object({
                    categories: z.array(z.object({
                        slug: z.string(),
                        displayName: z.string(),
                    })),
                    tables: z.array(z.object({
                        name: z.string(),
                        description: z.string(),
                        category: z.object({
                            slug: z.string(),
                            displayName: z.string(),
                        }),
                    })),
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

            generation.end({
                output: object,
            });

            trace.update({
                output: object,
            });

            logger.info(
                {
                    categoriesCount: object.categories.length,
                    tablesCount: object.tables.length,
                    categories: object.categories.map(c => c.displayName),
                },
                "Categories and tables extraction completed",
            );

            return object;
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

    async analyzeDocumentType(presignedUrl: string): Promise<DocumentTypeAndCategories> {
        logger.info({ presignedUrl }, "Starting document type analysis");

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");

        const prompt = `You're a document analysis expert. Analyze this document and provide:

        1. Document type (invoice, contract, form, purchase order, receipt, bank statement, etc.)
        2. Based on the document type, create a 1-2 sentence description for a process that would be used to extract the data from the document.
        Example: "Extracts invoice details, vendor information, billing information, line items and payment terms"
        3. A workflow name for the document type ex. Invoice processor
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
                schema: z.object({
                    workflowName: z.string(),
                    documentType: z.string(),
                    description: z.string(),
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

            generation.end({
                output: object,
            });

            // Now extract categories and tables using the document type
            const categoriesAndTables = await this.extractCategoriesAndTables(presignedUrl, object.documentType);

            const result = {
                workflowName: object.workflowName,
                documentType: object.documentType,
                description: object.description,
                categories: categoriesAndTables.categories,
                tables: categoriesAndTables.tables,
            };

            trace.update({
                output: result,
            });

            logger.info(
                {
                    documentType: result.documentType,
                    categoriesCount: result.categories.length,
                    tablesCount: result.tables.length,
                },
                "Document type analysis completed",
            );

            return result as DocumentTypeAndCategories;
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
        const categoryList = documentType.categories.map((c) => `- ${c.displayName} (${c.slug})`).join("\n");

        const prompt = `Extract singular fields (NOT tables or lists) from this ${documentType.documentType} document and assign each to one of these categories:

${categoryList}

For each field, provide:
- A clear, descriptive name (e.g., "invoice_number", "total_amount", "customer_name")
- The expected data type (text, number, date, currency, boolean)
- A detailed description that serves as instructions for AI extraction, including common label variations and formatting patterns
- The assigned category from the list above (provide both slug and displayName)

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

    async extractTableFields(presignedUrl: string, documentType: DocumentTypeAndCategories): Promise<any[]> {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API key not configured");
        }

        const model = google("gemini-2.5-flash");
        
        const tableList = documentType.tables.map(t => `- ${t.name}: ${t.description}`).join("\n");

        const prompt = `Extract the column structure and field definitions for these identified tables in this ${documentType.documentType} document:

${tableList}

For each table, analyze the actual data and provide:
- Column definitions with names, types (text, number, date, currency, boolean), and descriptions
- Focus on the actual fields/columns visible in the table data
- Ensure column names match what's actually shown in the document
- Provide detailed descriptions for AI extraction guidance

If a table is mentioned above but no actual tabular data is found in the document, return an empty columns array for that table.`;

        // Create a trace for this analysis step
        const trace = this.deps.langfuse.trace({
            name: "table-fields-extraction",
            metadata: {
                step: "table_fields_extraction",
                model: "gemini-2.5-flash",
                documentType: documentType.documentType,
                tablesCount: documentType.tables.length,
            },
        });

        const generation = trace.generation({
            name: "extract-table-fields",
            model: "gemini-2.5-flash",
            input: {
                prompt,
                image_url: presignedUrl,
                documentType: documentType.documentType,
                tables: documentType.tables,
            },
        });

        try {
            const { object } = await generateObject({
                model,
                schema: z.object({
                    tables: z.array(
                        z.object({
                            name: z.string(),
                            columns: z.array(
                                z.object({
                                    name: z.string(),
                                    description: z.string(),
                                    type: z.enum(["text", "number", "date", "currency", "boolean"]),
                                    required: z.boolean().default(false),
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

            // Bridge table metadata with field definitions
            const enrichedTables = object.tables.map(extractedTable => {
                const tableMetadata = documentType.tables.find(t => t.name === extractedTable.name);
                return {
                    name: extractedTable.name,
                    description: tableMetadata?.description || "",
                    category: tableMetadata?.category || { slug: "table_data", displayName: "Table Data" },
                    columns: extractedTable.columns,
                };
            });

            generation.end({
                output: enrichedTables,
            });

            trace.update({
                output: enrichedTables,
            });

            logger.info(
                {
                    tablesProcessed: enrichedTables.length,
                    tablesWithColumns: enrichedTables.filter(t => t.columns.length > 0).length,
                },
                "Table fields extraction completed",
            );

            return enrichedTables;
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
            // Step 1: Document Type Analysis (includes categories and table identification)
            const documentTypeAnalysis = await this.analyzeDocumentType(presignedUrl);
            
            // Step 2 & 3: Field Extraction and Table Field Extraction in parallel
            const [fieldAnalysis, enrichedTables] = await Promise.all([
                this.extractFieldsWithCategories(presignedUrl, documentTypeAnalysis),
                this.extractTableFields(presignedUrl, documentTypeAnalysis),
            ]);

            logger.info(
                {
                    documentType: documentTypeAnalysis.documentType,
                    description: documentTypeAnalysis.description,
                    fieldsCount: fieldAnalysis.suggestedFields.length,
                    tablesCount: enrichedTables.length,
                },
                "Complete document analysis finished",
            );

            return {
                workflowName: documentTypeAnalysis.workflowName,
                documentType: documentTypeAnalysis.documentType,
                description: documentTypeAnalysis.description,
                suggestedFields: fieldAnalysis.suggestedFields,
                suggestedTables: enrichedTables,
            };
        } catch (error) {
            parentTrace.update({
                output: error,
            });

            throw error;
        }
    }
}
