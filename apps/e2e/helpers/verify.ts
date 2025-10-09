import fs from "node:fs";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { expect, type Page } from "@playwright/test";
import { z } from "zod";
import { generateObject } from "ai";

const AccuracyResultSchema = z.object({
  accuracyScore: z.number().min(0).max(100),
  passed: z.boolean(),
  feedback: z.string(),
  mismatches: z
    .array(
      z.object({
        field: z.string(),
        expected: z.any(),
        actual: z.any(),
        issue: z.string(),
      }),
    )
    .optional(),
});

export async function verifyExtractionAccuracy(
  workflowId: string,
  workflowExecutionId: string,
  expectedResultFilePath: string,
  page: Page,
) {
  console.log("Verifying extraction accuracy...");
  const expectedResult = JSON.parse(fs.readFileSync(expectedResultFilePath, "utf-8"));
  const response = await page.request.fetch(`/api/v1/workflows/${workflowId}/executions/${workflowExecutionId}`, {});

  if (!response.ok()) {
    throw new Error(`Failed to fetch execution data: ${response.status()}`);
  }

  const { extractedData } = await response.json();

  if (!extractedData) {
    throw new Error("No extracted data found in execution result");
  }

  // Create a detailed comparison prompt
  const prompt = `You are an expert at verifying data extraction accuracy. 
  
I have two JSON objects:
1. Expected extraction result (what should have been extracted)
2. Actual extraction result (what was actually extracted)

Please compare the actual extraction against the expected result and verify if the extraction is accurate.

Expected Result:
${JSON.stringify(expectedResult, null, 2)}

Actual Result:
${JSON.stringify(extractedData, null, 2)}

Please:
1. Compare each field in the expected result with the actual result
2. Check if the values match or are reasonably close (for numbers, allow small rounding differences)
3. Calculate an accuracy score as a percentage (0-100%)
4. Determine if it passes the 90% threshold
5. Provide specific feedback on any mismatches

Return a JSON object with accuracyScore (number 0-100), passed (boolean), feedback (string), and optionally mismatches array.`;

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  const model = google("gemini-2.5-flash");
  const result = await generateObject({
    model,
    schema: AccuracyResultSchema,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Assert the test based on the result
  console.log(`Extraction accuracy: ${result.object.accuracyScore}%`);
  console.log(`Feedback: ${result.object.feedback}`);

  if (result.object.mismatches && result.object.mismatches.length > 0) {
    console.log("Mismatches found:");
    result.object.mismatches.forEach((mismatch) => {
      console.log(
        `- ${mismatch.field}: expected ${JSON.stringify(mismatch.expected)}, got ${JSON.stringify(mismatch.actual)} - ${mismatch.issue}`,
      );
    });
  }

  expect(result.object.passed).toBe(true);
  expect(result.object.accuracyScore).toBeGreaterThanOrEqual(90);
}
