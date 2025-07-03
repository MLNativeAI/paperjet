import { type FieldCategoryAnalysis, fieldCategoryAnalysisSchema } from "@paperjet/db/types";
import { logger } from "@paperjet/shared";
import { generateObject } from "ai";
import type { Langfuse } from "langfuse";
import { z } from "zod";
import { aiSdkModel } from "../lib/model";

export interface DocumentAnalysisServiceDeps {
    langfuse: Langfuse;
}



const categoriesZodSchema = z.object({
    categories: z.array(z.object({
        slug: z.string(),
        displayName: z.string(),
        ordinal: z.number(),
        tables: z.array(z.object({
            name: z.string(),
            description: z.string(),
        })),
    })),
})


// Multi-step analysis schemas
export const documentTypeSchema = z.object({
    workflowName: z.string(),
    documentType: z.string(),
    description: z.string(),
});
export type DocumentType = z.infer<typeof documentTypeSchema>;


type CategoriesType = z.infer<typeof categoriesZodSchema>;

export class DocumentAnalysisService {
    constructor(private deps: DocumentAnalysisServiceDeps) {}


    async analyzeDocumentType(presignedUrl: string): Promise<DocumentTypeAndCategories> {
        logger.info({ presignedUrl }, "Starting document type analysis");

        const prompt = `You're a document analysis expert. Analyze this document and provide:

        1. Document type (invoice, contract, form, purchase order, receipt, bank statement, etc.)
        2. Based on the document type, create a 1-2 sentence description for a process that would be used to extract the data from the document.
        Example: "Extracts invoice details, vendor information, billing information, line items and payment terms"
        3. A workflow name for the document type ex. Invoice processor
        `;

        try {
            const { object } = await generateObject({
                model: aiSdkModel(),
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
            });


            return object
        } catch (error) {
            throw error;
        }
    }

    async identifyCategoriesAndTables(presignedUrl: string): Promise<CategoriesType> {
        logger.info({ presignedUrl }, "Starting categories and tables extraction");

        const prompt = `Analyze this document and extract information in a structured way:

1. **Data Categories**: Identify logical groupings of information in the document in the order they appear (e.g., "Invoice Details", "Vendor Information", "Billing Information", "Line Items", "Payment Terms")

2. **Table Structures**: For each category, identify any tabular data like line items, product lists, transaction details, or data grids that belong to that category

For each category, provide:
- slug: snake_case version (e.g., "invoice_details", "vendor_information", "billing_information")
- displayName: Human-readable format (e.g., "Invoice Details", "Vendor Information", "Billing Information")
- ordinal: The order in which this category appears in the document (starting from 0)
- tables: Array of tables that belong to this category

For each table within a category, provide:
- name: Descriptive table name
- description: What the table contains

Important: Categories should be listed in the order they appear in the document, and tables should be nested within their respective categories. Focus on business-relevant data structures and logical information groupings.`;

        try {
            const { object } = await generateObject({
                model: aiSdkModel(),
                schema: categoriesZodSchema,
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
                ]
            });

            logger.info(
                {
                    categoriesCount: object.categories.length,
                    tablesCount: object.categories.reduce((total, cat) => total + cat.tables.length, 0),
                    categories: object.categories.map(c => c.displayName),
                },
                "Categories and tables extraction completed",
            );

            return object;
        } catch (error) {
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

        try {
            const { object } = await generateObject({
                model: aiSdkModel(),
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
                ]
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
            throw error;
        }
    }

    async extractTableFields(presignedUrl: string, documentType: DocumentTypeAndCategories): Promise<any[]> {
        const tableList = documentType.tables.map(t => `- ${t.name}: ${t.description}`).join("\n");

        const prompt = `Extract the column structure and field definitions for these identified tables in this ${documentType.documentType} document:

${tableList}

For each table, analyze the actual data and provide:
- Column definitions with names, types (text, number, date, currency, boolean), and descriptions
- Focus on the actual fields/columns visible in the table data
- Ensure column names match what's actually shown in the document
- Provide detailed descriptions for AI extraction guidance

If a table is mentioned above but no actual tabular data is found in the document, return an empty columns array for that table.`;

        try {
            const { object } = await generateObject({
                model: aiSdkModel(),
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
                ]
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
            return [];
        }
    }

    async performCompleteAnalysis(presignedUrl: string) {
        logger.info({ presignedUrl }, "Starting complete document analysis");

        try {
            const documentTypeAnalysis = await this.analyzeDocumentType(presignedUrl);

            const categoriesAndTables = await this.identifyCategoriesAndTables(presignedUrl);


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
            throw error;
        }
    }
}
