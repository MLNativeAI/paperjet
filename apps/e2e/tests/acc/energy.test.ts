import path from "node:path";
import { test } from "@playwright/test";
import dotenv from "dotenv";
import { awaitWorkflowExecutionCompleted, createNewWorkflow, startWorkflowExecution } from "../../helpers/test-helpers";
import { verifyExtractionAccuracy } from "../../helpers/verify";
import { energyConfig } from "../../fixtures/energy/config";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

test.setTimeout(180000); // 3 minutes

test.describe("Extract energy invoice for Energa", () => {
  test("create workflow, run extraction and verify", async ({ page }) => {
    const inputFilePath = path.join(process.cwd(), "/fixtures/energy/energa.pdf");
    const expectedResultFilePath = path.join(process.cwd(), "/fixtures/energy/energa.json");
    const workflowId = await createNewWorkflow(
      "Energy invoice data",
      "Extracts core invoice information",
      energyConfig,
      page,
      "accurate",
    );
    const workflowExecutionId = await startWorkflowExecution(workflowId, inputFilePath, page);
    await awaitWorkflowExecutionCompleted(workflowId, workflowExecutionId, page);
    await verifyExtractionAccuracy(workflowId, workflowExecutionId, expectedResultFilePath, page);
  });
});

test.describe("Extract energy invoice for Tauron", () => {
  test("create workflow, run extraction and verify", async ({ page }) => {
    const inputFilePath = path.join(process.cwd(), "/fixtures/energy/tauron.pdf");
    const expectedResultFilePath = path.join(process.cwd(), "/fixtures/energy/tauron.json");
    const workflowId = await createNewWorkflow(
      "Energy invoice data",
      "Extracts core invoice information",
      energyConfig,
      page,
      "accurate",
    );
    const workflowExecutionId = await startWorkflowExecution(workflowId, inputFilePath, page);
    await awaitWorkflowExecutionCompleted(workflowId, workflowExecutionId, page);
    await verifyExtractionAccuracy(workflowId, workflowExecutionId, expectedResultFilePath, page);
  });
});

test.describe("Extract energy invoice for Eon", () => {
  test("create workflow, run extraction and verify", async ({ page }) => {
    const inputFilePath = path.join(process.cwd(), "/fixtures/energy/eon.pdf");
    const expectedResultFilePath = path.join(process.cwd(), "/fixtures/energy/eon.json");
    const workflowId = await createNewWorkflow(
      "Energy invoice data",
      "Extracts core invoice information",
      energyConfig,
      page,
      "accurate",
    );
    const workflowExecutionId = await startWorkflowExecution(workflowId, inputFilePath, page);
    await awaitWorkflowExecutionCompleted(workflowId, workflowExecutionId, page);
    await verifyExtractionAccuracy(workflowId, workflowExecutionId, expectedResultFilePath, page);
  });
});
