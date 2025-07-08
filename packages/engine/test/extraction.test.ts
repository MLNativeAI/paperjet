import { describe, test } from "bun:test";
import { DocumentExtractionService } from "../src/services/document-extraction-service";
import {
  compareExtractionResults,
  ensureCacheDir,
  getCachedResult,
  loadFixture,
  saveCachedResult,
  type TestCase,
} from "./utils";

// Define test cases
const testCases: TestCase[] = [
  {
    name: "Bank Statement",
    fixture: "bank_details_extractor",
    documentUrl: "https://i.ibb.co/2YNJLKCd/bank-statement.webp",
  },
  // {
  //   name: "Invoice - Standard Format",
  //   fixture: "invoice_extractor",
  //   documentUrl: "/home/lmyslinski/Documents/PaperJet/test-docs/bank_statement.pdf",
  // },
  // Add more test cases here as you create more fixtures
];

// 60 seconds
const timeout = 60000;

describe("test document extraction accuracy", () => {
  const service = new DocumentExtractionService();

  // Ensure cache directory exists
  ensureCacheDir();

  // Run each test case
  testCases.forEach((testCase) => {
    const testFn = testCase.skipReason ? test.skip : test;

    testFn(
      testCase.name,
      async () => {
        // Skip test if reason provided
        if (testCase.skipReason) {
          console.log(`Skipping test: ${testCase.skipReason}`);
          return;
        }

        const { config, expectedResult } = await loadFixture(testCase.fixture);

        // Try to get cached result first
        let actualResult = await getCachedResult(testCase);

        if (actualResult) {
          console.log(`Using cached result for ${testCase.name}`);
        } else {
          console.log(`Running extraction for ${testCase.name}`);
          actualResult = await service.extractDataFromDocument(testCase.documentUrl, config);

          // Save result to cache
          await saveCachedResult(testCase, actualResult);
        }

        const comparison = compareExtractionResults(actualResult, expectedResult);

        // Fail test if either score is below 90%
        if (comparison.fieldScore < 90 || comparison.tableScore < 90) {
          throw new Error(
            `Test failed: Field Score: ${comparison.fieldScore.toFixed(2)}%, Table Score: ${comparison.tableScore.toFixed(2)}%`,
          );
        }
      },
      timeout,
    );
  });
});
