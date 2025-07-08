import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { distance } from "fastest-levenshtein";

import type { ExtractionResult, WorkflowConfiguration } from "../src/types";

export interface TestCase {
  name: string;
  fixture: string;
  documentUrl: string;
  skipReason?: string;
}

export async function loadFixture(
  fixtureName: string,
): Promise<{ config: WorkflowConfiguration; expectedResult: ExtractionResult }> {
  const configPath = path.join(fixturesDir, `${fixtureName}_config.json`);
  const resultsPath = path.join(fixturesDir, `${fixtureName}_results.json`);

  const [configData, resultsData] = await Promise.all([readFile(configPath, "utf-8"), readFile(resultsPath, "utf-8")]);

  return {
    config: JSON.parse(configData) as WorkflowConfiguration,
    expectedResult: JSON.parse(resultsData) as ExtractionResult,
  };
}

export function calculateAccuracyScore(expected: string, actual: string): number {
  // Handle edge cases
  if (expected === actual) return 100;
  if (expected.length === 0 && actual.length === 0) return 100;

  const levenshteinDistance = distance(expected, actual);
  const maxPossibleDistance = Math.max(expected.length, actual.length);

  // Normalize: 0 distance = 100% accuracy, max distance = 0% accuracy
  const accuracy = ((maxPossibleDistance - levenshteinDistance) / maxPossibleDistance) * 100;

  return Math.max(0, Math.min(100, accuracy));
}

export function compareExtractionResults(actualResult: ExtractionResult, expectedResult: ExtractionResult) {
  const expectedFields = expectedResult.fields;
  const expectedTables = expectedResult.tables;

  const expectedFieldsStr = JSON.stringify(expectedFields, null, 2);
  const actualFieldsStr = JSON.stringify(actualResult.fields, null, 2);
  const expectedTablesStr = JSON.stringify(expectedTables, null, 2);
  const actualTablesStr = JSON.stringify(actualResult.tables, null, 2);

  const fieldDiff = distance(expectedFieldsStr, actualFieldsStr);
  const tableDiff = distance(expectedTablesStr, actualTablesStr);

  const fieldScore = calculateAccuracyScore(expectedFieldsStr, actualFieldsStr);
  const tableScore = calculateAccuracyScore(expectedTablesStr, actualTablesStr);

  const overallScore = (fieldScore + tableScore) / 2;

  console.log(`Field Diff: ${fieldDiff}, Table Diff: ${tableDiff}`);
  console.log(`Field Score: ${fieldScore.toFixed(2)}%, Table Score: ${tableScore.toFixed(2)}%`);
  console.log(`Overall Score: ${overallScore.toFixed(2)}%`);

  return { fieldDiff, tableDiff, fieldScore, tableScore, overallScore };
}

// Check if --clean flag is passed
export const isCleanRun = process.argv.includes("--clean");

// Use fixtures directory for cache
export const fixturesDir = path.join(__dirname, "fixtures");

export async function ensureCacheDir() {
  await mkdir(fixturesDir, { recursive: true });
}

export async function getCachedResult(testCase: TestCase): Promise<ExtractionResult | null> {
  if (isCleanRun) return null;

  const cacheFile = path.join(fixturesDir, `${testCase.fixture}_output_cache.json`);
  const cachedData = await readFile(cacheFile, "utf-8");
  return JSON.parse(cachedData) as ExtractionResult;
}

export async function saveCachedResult(testCase: TestCase, result: ExtractionResult): Promise<void> {
  const cacheFile = path.join(fixturesDir, `${testCase.fixture}_output_cache.json`);
  await writeFile(cacheFile, JSON.stringify(result, null, 2));
}
