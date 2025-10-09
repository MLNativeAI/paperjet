import path from "node:path";
import { test } from "@playwright/test";
import dotenv from "dotenv";
import { bloodWorkflowConfig } from "../../fixtures/blood/config";
import { awaitWorkflowExecutionCompleted, createNewWorkflow, startWorkflowExecution } from "../../helpers/test-helpers";
import { verifyExtractionAccuracy } from "../../helpers/verify";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

test.setTimeout(180000); // 3 minutes

test.describe("Extract blood results ", () => {
  test("create workflow, run extraction and verify", async ({ page }) => {
    const inputFilePath = path.join(process.cwd(), "/fixtures/blood/input.pdf");
    const expectedResultFilePath = path.join(process.cwd(), "/fixtures/blood/blood.json");
    const workflowId = await createNewWorkflow(
      "Blood results",
      "Extracts lab results ",
      bloodWorkflowConfig,
      page,
      "accurate",
    );
    const workflowExecutionId = await startWorkflowExecution(workflowId, inputFilePath, page);
    await awaitWorkflowExecutionCompleted(workflowId, workflowExecutionId, page);
    await verifyExtractionAccuracy(workflowId, workflowExecutionId, expectedResultFilePath, page);
  });
});
