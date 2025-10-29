import { getDocumentPageById, updateDocumentPageData } from "@paperjet/db";
import { logger } from "@paperjet/shared";
import { generateText } from "ai";
import { s3Client } from "../lib/s3";
import { getModelForType } from "./admin/model-service";

export type MarkdownDocument = {
  pages: string[];
  fullDocument: string;
};

export const convertPageToMarkdown = async (workflowExecutionId: string, documentPageId: string): Promise<void> => {
  const pageData = await getDocumentPageById({ documentPageId });
  const pageFilePath = `executions/${workflowExecutionId}/pages/page-${pageData.pageNumber}.png`;
  const pageBuffer = await s3Client.file(pageFilePath).arrayBuffer();
  logger.info(`Converting page ${pageData.pageNumber} to markdown`);
  const markdownPage = await extractMarkdownFromPageImage(pageBuffer);
  await updateDocumentPageData({ rawMarkdown: markdownPage, documentPageId });
  logger.info(`Converted page ${pageData.pageNumber} to markdown`);
};

const extractMarkdownFromPageImage = async (pageBuffer: ArrayBuffer) => {
  const prompt =
    "You're an expert in document processing. Please convert this document page into markdown. Reply only with the markdown, make sure to preserve all of the original content of the document page.";

  const result = await generateText({
    model: await getModelForType("vision"),
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
            image: pageBuffer,
          },
        ],
      },
    ],
  });

  return result.text;
};
