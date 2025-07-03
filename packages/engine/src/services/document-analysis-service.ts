import { logger } from "@paperjet/shared";
import { generateObject } from "ai";
import { z } from "zod";
import { aiSdkModel } from "../lib/model";
import { type CategoriesConfiguration, type FieldsConfiguration, type TableConfiguration } from "../types";

export type AnalysisResult = {
    workflowName: string;
    description: string;
    categories: CategoriesConfiguration;
    fields: FieldsConfiguration;
    tables: TableConfiguration;
};

export async function performCompleteAnalysis(presignedUrl: string): Promise<AnalysisResult> {
    logger.info({ presignedUrl }, "Starting complete document analysis");

    try {
        // Step 1: Analyze document type and identify categories/tables
        const [documentTypeAnalysis, categoriesAndTables] = await Promise.all([
            analyzeDocumentType(presignedUrl),
            identifyCategoriesAndTables(presignedUrl),
        ]);

        const categories = categoriesAndTables.categories.map((category, idx) => ({
            ...category,
            categoryId: `cat_${idx + 1}`,
        }));

        // Combine document type with categories for table processing
        const allTables = categories.flatMap((category) =>
            category.tables.map((table) => ({
                ...table,
                categoryId: category.categoryId,
                categoryName: category.displayName,
            })),
        );

        // Step 2: Extract ALL fields at once with category assignments
        const allFieldsWithCategories = await extractAllFieldsWithCategories(presignedUrl, categories);

        // Step 3: Extract table fields for each table in parallel
        const tableFieldPromises = allTables.map((table) => extractFieldsForTable(presignedUrl, table));
        const tableFieldResults = await Promise.all(tableFieldPromises);

        logger.info("Complete document analysis finished");

        return {
            workflowName: documentTypeAnalysis.workflowName,
            description: documentTypeAnalysis.description,
            categories: categories.map((cat) => {
                return {
                    categoryId: cat.categoryId,
                    slug: cat.slug,
                    displayName: cat.displayName,
                    ordinal: cat.ordinal,
                };
            }),
            fields: allFieldsWithCategories,
            tables: tableFieldResults.flat(),
        };
    } catch (error) {
        throw error;
    }
}

const documentTypeSchema = z.object({
    workflowName: z.string(),
    documentType: z.string(),
    description: z.string(),
});

async function analyzeDocumentType(presignedUrl: string): Promise<z.infer<typeof documentTypeSchema>> {
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
            schema: documentTypeSchema,
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

        return object;
    } catch (error) {
        throw error;
    }
}

const categoriesZodSchema = z.object({
    categories: z.array(
        z.object({
            slug: z.string(),
            displayName: z.string(),
            ordinal: z.number(),
            tables: z.array(
                z.object({
                    name: z.string(),
                    description: z.string(),
                }),
            ),
        }),
    ),
});

async function identifyCategoriesAndTables(presignedUrl: string): Promise<z.infer<typeof categoriesZodSchema>> {
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
            ],
        });

        logger.info(
            {
                categoriesCount: object.categories.length,
                tablesCount: object.categories.reduce((total, cat) => total + cat.tables.length, 0),
                categories: object.categories.map((c) => c.displayName),
            },
            "Categories and tables extraction completed",
        );

        return object;
    } catch (error) {
        throw error;
    }
}

// Schema for extracting all fields at once with category assignments
const allFieldsExtractionSchema = z.object({
    fields: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            type: z.enum(["text", "number", "date", "currency", "boolean"]),
            categoryId: z.string(),
        }),
    ),
});

async function extractAllFieldsWithCategories(
    presignedUrl: string,
    categories: Array<{ categoryId: string; displayName: string; slug: string; ordinal: number }>,
): Promise<FieldsConfiguration> {
    logger.info(
        {
            categoriesCount: categories.length,
        },
        "Starting unified field extraction for all categories",
    );

    const categoriesDescription = categories
        .map((cat) => `- ${cat.categoryId}: "${cat.displayName}" (${cat.slug})`)
        .join("\n");

    const prompt = `Extract ALL singular fields (NOT tables or lists) from this document and assign each field to exactly ONE of the following categories:

${categoriesDescription}

For each field found in the document:
1. Provide a clear, descriptive name (e.g., "invoice_number", "total_amount", "customer_name")
2. Determine the expected data type (text, number, date, currency, boolean)
3. Write a detailed description that serves as instructions for AI extraction, including common label variations and formatting patterns
4. Assign it to the MOST APPROPRIATE category ID based on where it logically belongs

Important rules:
- Each field should appear ONLY ONCE in the entire list
- Assign each field to the category where it most logically belongs
- If a field could belong to multiple categories, choose the most specific/primary one
- Common fields like invoice_number, dates, and totals should be assigned to their primary category (usually the header or summary)

Examples of good field descriptions:
- "invoice_number": "The unique identifier for this invoice, often labeled as 'Invoice #', 'Invoice Number', 'Document Number', or similar, typically alphanumeric"
- "total_amount": "The final total amount due, usually labeled as 'Total', 'Amount Due', 'Grand Total', or 'Total Amount', excluding currency symbols"
- "invoice_date": "The date when the invoice was created or issued, typically labeled as 'Invoice Date', 'Date', or 'Issued' in MM/DD/YYYY or similar format"

Extract all fields from the document, ensuring no duplicates.`;

    const { object } = await generateObject({
        model: aiSdkModel(),
        schema: allFieldsExtractionSchema,
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

    logger.info(
        {
            totalFields: object.fields.length,
            fieldsByCategory: categories.map((cat) => ({
                category: cat.displayName,
                count: object.fields.filter((f) => f.categoryId === cat.categoryId).length,
            })),
        },
        "Unified field extraction completed",
    );

    return object.fields.map((field) => ({
        ...field,
        required: true,
    }));
}

// Schema for single table extraction
const singleTableExtractionSchema = z.object({
    columns: z.array(
        z.object({
            name: z.string(),
            description: z.string(),
            type: z.enum(["text", "number", "date", "currency", "boolean"]),
            required: z.boolean().default(false),
        }),
    ),
});

async function extractFieldsForTable(
    presignedUrl: string,
    table: { name: string; description: string; categoryName: string; categoryId: string },
) {
    logger.info(
        {
            tableName: table.name,
        },
        "Starting field extraction for table",
    );

    const prompt = `Extract the column structure and field definitions for the table "${table.name}" in this document.

Table description: ${table.description}
Category: ${table.categoryName}

Analyze the actual tabular data for "${table.name}" and provide:
- Column definitions with names, types (text, number, date, currency, boolean), and descriptions
- Focus on the actual fields/columns visible in the table data
- Ensure column names match what's actually shown in the document
- Provide detailed descriptions for AI extraction guidance

If the table "${table.name}" is not found or has no actual tabular data in the document, return an empty columns array.`;

    const { object } = await generateObject({
        model: aiSdkModel(),
        schema: singleTableExtractionSchema,
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

    logger.info("Field extraction for table completed");

    return {
        name: table.name,
        description: table.description,
        columns: object.columns,
        categoryId: table.categoryId,
    };
}
