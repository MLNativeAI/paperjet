import { db } from "@paperjet/db";
import { file, workflow, workflowFile } from "@paperjet/db/schema";
import {
  type DocumentAnalysis,
  type WorkflowConfiguration,
  documentAnalysisSchema,
  workflowConfigurationSchema,
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

Consider common fields for this document type and what would be most useful for business processes.

Provide a structured analysis with:
- Document type identification
- Confidence score (0-1)
- Suggested fields with name, description, and data type
- Suggested tables with column definitions

Focus on practical, commonly needed information extraction.

Please analyze this document and suggest fields to extract.`,
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
  });

export default router;

export type WorkflowRouteType = typeof router;