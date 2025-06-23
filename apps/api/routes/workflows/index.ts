import { db } from "@paperjet/db";
import { file, workflow, workflowFile } from "@paperjet/db/schema";
import {
  type DocumentAnalysis,
  type WorkflowConfiguration,
  type ExtractionResult,
  documentAnalysisSchema,
  workflowConfigurationSchema,
  extractionResultSchema,
} from "@paperjet/db/types";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getUser } from "@/lib/auth";
import { s3 } from "@/lib/s3";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

const app = new Hono();

const router = app
  .get("/", async (c) => {
    const user = await getUser(c);
    const workflows = await db
      .select()
      .from(workflow)
      .where(eq(workflow.ownerId, user.id));
    return c.json(workflows);
  })
  .get("/:id", async (c) => {
    const user = await getUser(c);
    const workflowId = c.req.param("id");

    const [workflowData] = await db
      .select()
      .from(workflow)
      .where(eq(workflow.id, workflowId));

    if (!workflowData || workflowData.ownerId !== user.id) {
      return c.json({ error: "Workflow not found" }, 404);
    }

    return c.json({
      ...workflowData,
      configuration: JSON.parse(workflowData.configuration),
    });
  })
  .post("/", async (c) => {
    try {
      const user = await getUser(c);
      const body = await c.req.json();

      const createWorkflowSchema = z.object({
        name: z.string(),
        documentType: z.string(),
        configuration: workflowConfigurationSchema,
        fileId: z.string().optional(),
      });

      const validatedData = createWorkflowSchema.parse(body);
      const id = crypto.randomUUID();

      await db.insert(workflow).values({
        id,
        name: validatedData.name,
        documentType: validatedData.documentType,
        configuration: JSON.stringify(validatedData.configuration),
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Link file to workflow if provided
      if (validatedData.fileId) {
        await db.insert(workflowFile).values({
          id: crypto.randomUUID(),
          workflowId: id,
          fileId: validatedData.fileId,
          createdAt: new Date(),
        });
      }

      return c.json({ id, message: "Workflow created successfully" }, 201);
    } catch (error) {
      console.error("Create workflow error:", error);
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid workflow data" }, 400);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post("/analyze", async (c) => {
    try {
      const user = await getUser(c);
      const body = await c.req.formData();
      const fileParam = body.get("file") as File;

      if (!fileParam) {
        return c.json({ error: "File is required" }, 400);
      }

      // Save file first
      const fileId = crypto.randomUUID();
      const filename = `workflow-samples/${fileId}-${fileParam.name}`;

      await db.insert(file).values({
        id: fileId,
        filename,
        createdAt: new Date(),
        ownerId: user.id,
      });

      const fileBuffer = await fileParam.arrayBuffer();
      await s3.file(filename).write(fileBuffer);

      // Get presigned URL for the file
      const presignedUrl = await s3.presign(filename);

      console.log(presignedUrl)

      // Analyze document with Gemini Flash
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error("Google API key not configured");
      }

      const model = google("gemini-2.5-flash");

      const { object } = await generateObject({
        model,
        schema: documentAnalysisSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a document analysis expert. Analyze this document and determine:
1. The type of document (invoice, receipt, contract, purchase order, bank statement, etc.)
2. Key fields that should be extracted from this type of document
3. Any tables or repeated data structures that should be extracted

IMPORTANT: For each field, provide a DETAILED description that explains:
- What specific information this field contains
- Where it's typically located on this type of document  
- Any formatting or characteristics that help identify it
- Examples of what the extracted value should look like

For each table, describe:
- What type of data rows it contains
- The business purpose of the table
- How to identify the table boundaries

The descriptions will be used by an AI system to locate and extract the actual data, so be precise and comprehensive.

Examples of good field descriptions:
- "merchant_name": "The business name or company name that issued this invoice, typically found at the top of the document in large text or letterhead"
- "total_amount": "The final amount due including all taxes and fees, usually labeled as 'Total', 'Amount Due', or 'Balance Due' and displayed prominently"
- "invoice_date": "The date when the invoice was created or issued, typically labeled as 'Invoice Date', 'Date', or 'Issued' in MM/DD/YYYY or similar format"

Provide a structured analysis with practical, commonly needed information extraction focused on business processes.`,
              },
              {
                type: "image",
                image: new URL(presignedUrl),
              },
            ],
          },
        ],
      });

      return c.json({
        fileId,
        analysis: object as DocumentAnalysis,
      });
    } catch (error) {
      console.error("Document analysis error:", error);
      return c.json({ error: "Failed to analyze document" }, 500);
    }
  })
  .post("/extract", async (c) => {
    try {
      const user = await getUser(c);
      const body = await c.req.json();
      
      const extractSchema = z.object({
        fileId: z.string(),
        fields: z.array(z.object({
          name: z.string(),
          description: z.string(),
          type: z.enum(["text", "number", "date", "currency", "boolean"]),
        })),
        tables: z.array(z.object({
          name: z.string(),
          description: z.string(),
          columns: z.array(z.object({
            name: z.string(),
            description: z.string(),
            type: z.enum(["text", "number", "date", "currency", "boolean"]),
          })),
        })),
      });

      const validatedData = extractSchema.parse(body);

      // Get file from database
      const [fileRecord] = await db
        .select()
        .from(file)
        .where(eq(file.id, validatedData.fileId));

      if (!fileRecord || fileRecord.ownerId !== user.id) {
        return c.json({ error: "File not found" }, 404);
      }

      // Get presigned URL for the file
      const presignedUrl = await s3.presign(fileRecord.filename);

      // Create dynamic schema based on provided fields and tables
      const fieldSchemas = validatedData.fields.map(field => {
        let zodType;
        switch (field.type) {
          case "number":
            zodType = "z.number().nullable()";
            break;
          case "date":
            zodType = "z.string().nullable()"; // Date as ISO string
            break;
          case "currency":
            zodType = "z.number().nullable()"; // Currency as number
            break;
          case "boolean":
            zodType = "z.boolean().nullable()";
            break;
          default:
            zodType = "z.string().nullable()";
        }
        return `${field.name}: ${zodType}`;
      }).join(",\n  ");

      const tableSchemas = validatedData.tables.map(table => {
        const columnSchemas = table.columns.map(col => {
          let zodType;
          switch (col.type) {
            case "number":
              zodType = "z.number().nullable()";
              break;
            case "date":
              zodType = "z.string().nullable()";
              break;
            case "currency":
              zodType = "z.number().nullable()";
              break;
            case "boolean":
              zodType = "z.boolean().nullable()";
              break;
            default:
              zodType = "z.string().nullable()";
          }
          return `${col.name}: ${zodType}`;
        }).join(",\n    ");
        
        return `${table.name}: z.array(z.object({\n    ${columnSchemas}\n  }))`;
      }).join(",\n  ");

      const fullSchema = `z.object({
  ${fieldSchemas}${fieldSchemas && tableSchemas ? ",\n  " : ""}${tableSchemas}
})`;

      // Build extraction prompt with field descriptions
      const fieldDescriptions = validatedData.fields.map(field => 
        `- ${field.name} (${field.type}): ${field.description}`
      ).join("\n");

      const tableDescriptions = validatedData.tables.map(table => {
        const columnDescs = table.columns.map(col => 
          `    - ${col.name} (${col.type}): ${col.description}`
        ).join("\n");
        return `- ${table.name}: ${table.description}\n${columnDescs}`;
      }).join("\n");

      const prompt = `Extract the following information from this document:

FIELDS TO EXTRACT:
${fieldDescriptions}

${tableDescriptions ? `TABLES TO EXTRACT:\n${tableDescriptions}` : ''}

Instructions:
- Extract exact values as they appear in the document
- For currency fields, extract as numbers (remove currency symbols)
- For date fields, use ISO format (YYYY-MM-DD) 
- For boolean fields, return true/false based on presence or checkmarks
- If a field is not found or unclear, return null
- For tables, extract all rows found
- Maintain data accuracy and completeness`;

      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error("Google API key not configured");
      }

      const model = google("gemini-2.5-flash");

      // Build dynamic schema object for generateObject
      const schemaObj = eval(`(${fullSchema})`);

      const { object } = await generateObject({
        model,
        schema: schemaObj,
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

      // Transform the result to match our extraction result schema
      const extractionResult: ExtractionResult = {
        fields: validatedData.fields.map(field => ({
          fieldName: field.name,
          value: (object as any)[field.name],
          confidence: 0.9, // Default confidence, could be enhanced
        })),
        tables: validatedData.tables.map(table => ({
          tableName: table.name,
          rows: ((object as any)[table.name] || []).map((row: any) => ({
            values: row,
          })),
          confidence: 0.9,
        })),
      };

      return c.json({
        fileId: validatedData.fileId,
        extractionResult,
      });
    } catch (error) {
      console.error("Data extraction error:", error);
      return c.json({ error: "Failed to extract data from document" }, 500);
    }
  })
  .get("/:fileId/document", async (c) => {
    try {
      const user = await getUser(c);
      const fileId = c.req.param("fileId");

      // Get file from database
      const [fileRecord] = await db
        .select()
        .from(file)
        .where(eq(file.id, fileId));

      if (!fileRecord || fileRecord.ownerId !== user.id) {
        return c.json({ error: "File not found" }, 404);
      }

      // Get presigned URL for the file
      const presignedUrl = await s3.presign(fileRecord.filename);

      return c.json({
        fileId,
        filename: fileRecord.filename,
        presignedUrl,
      });
    } catch (error) {
      console.error("Get document error:", error);
      return c.json({ error: "Failed to get document" }, 500);
    }
  });

export default router;

export type WorkflowRouteType = typeof router;