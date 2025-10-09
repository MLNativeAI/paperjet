import type { workflowTemplates } from "@/data/workflow-templates";

export type WorkflowTemplate = (typeof workflowTemplates)[number];

export const prepareTemplateData = async (template: WorkflowTemplate) => {
  // Fetch the template file from the public folder
  const templateFileResponse = await fetch(template.templateFile);
  if (!templateFileResponse.ok) {
    throw new Error("Failed to fetch template file");
  }

  const templateFileBlob = await templateFileResponse.blob();
  const templateFile = new File([templateFileBlob], template.templateFile.split("/").pop() || "template", {
    type: templateFileBlob.type,
  });

  // Prepare the template data for API call
  return {
    slug: template.slug,
    description: template.description,
    configuration: JSON.stringify(template.configuration),
    categories: JSON.stringify(template.categories),
    sampleData: JSON.stringify(template.sampleData),
    templateFile: templateFile,
  };
};
