import { logger } from "@paperjet/shared";
import { generateObject } from "ai";
import { z } from "zod";
import { aiSdkModel } from "../lib/model";

export type AnalysisResult = {
    workflowName: string;
    description: string;
    categories: Array<{
        categoryId: string;
        slug: string;
        displayName: string;
        ordinal: number;
    }>;
    suggestedFields: Array<{
        name: string;
        description: string;
        type: "text" | "number" | "date" | "currency" | "boolean";
        required: boolean;
        categoryId: string;
    }>;
    suggestedTables: Array<{
        name: string;
        description: string;
        categoryId: string;
    }>;
}

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
        const allTables = categories.flatMap(category =>
            category.tables.map(table => ({
                ...table,
                categoryId: category.categoryId,
                categoryName: category.displayName,
            }))
        );

        // Step 2: Extract fields for each category in parallel
        const categoryFieldPromises = categories.map(category =>
            extractFieldsForCategory(presignedUrl, category.categoryId, category.displayName)
        );

        // Step 3: Extract table fields for each table in parallel
        const tableFieldPromises = allTables.map(table =>
            extractFieldsForTable(presignedUrl, table)
        );

        // Execute all field and table extractions in parallel
        const [categoryFieldResults, tableFieldResults] = await Promise.all([
            Promise.all(categoryFieldPromises),
            Promise.all(tableFieldPromises),
        ]);

        logger.info("Complete document analysis finished");

        return {
            workflowName: documentTypeAnalysis.workflowName,
            description: documentTypeAnalysis.description,
            categories: categories,
            suggestedFields: categoryFieldResults.flat(),
            suggestedTables: tableFieldResults.flat()
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

        return object
    } catch (error) {
        throw error;
    }
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


// Schema for single category field extraction
const categoryFieldExtractionSchema = z.object({
    suggestedFields: z.array(z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
    })),
});

async function extractFieldsForCategory(
    presignedUrl: string,
    categoryId: string,
    categoryName: string
) {
    logger.info(
        {
            categoryId,
            categoryName,
        },
        "Starting field extraction for category",
    );

    const prompt = `Extract singular fields (NOT tables or lists) from this document that belong specifically to the "${categoryName}" category.

For each field found in this category, provide:
- A clear, descriptive name (e.g., "invoice_number", "total_amount", "customer_name")
- The expected data type (text, number, date, currency, boolean)
- A detailed description that serves as instructions for AI extraction, including common label variations and formatting patterns

Focus on extracting fields that logically belong to the "${categoryName}" section of the document:
1. **Identification fields**: Document numbers, IDs, reference codes
2. **Key entities**: Names, addresses, contact information
3. **Important dates**: Creation dates, due dates, effective dates
4. **Financial information**: Amounts, taxes, totals, currency values
5. **Status indicators**: Approval status, document state, flags

Examples of good field descriptions:
- "invoice_number": "The unique identifier for this invoice, often labeled as 'Invoice #', 'Invoice Number', 'Document Number', or similar, typically alphanumeric"
- "total_amount": "The final total amount due, usually labeled as 'Total', 'Amount Due', 'Grand Total', or 'Total Amount', excluding currency symbols"
- "invoice_date": "The date when the invoice was created or issued, typically labeled as 'Invoice Date', 'Date', or 'Issued' in MM/DD/YYYY or similar format"

Only return fields that clearly belong to the "${categoryName}" category. If no fields are found for this category, return an empty array.`;

    const { object } = await generateObject({
        model: aiSdkModel(),
        schema: categoryFieldExtractionSchema,
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
        "Field extraction for category completed",
    );

    return object.suggestedFields.map(field => ({
        ...field,
        categoryId,
        required: true,
    }));
}


// Schema for single table extraction
const singleTableExtractionSchema = z.object({
    columns: z.array(z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(["text", "number", "date", "currency", "boolean"]),
        required: z.boolean().default(false),
    })),
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
        ]
    });

    logger.info(
        "Field extraction for table completed",
    );

    return object.columns.map(column => ({
        ...column,
        categoryId: table.categoryId,
        required: true,
    }));
}