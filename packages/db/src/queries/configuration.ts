import { eq } from "drizzle-orm";
import { db } from "../db";
import { modelConfiguration, runtimeConfiguration } from "../schema";
import type { RuntimeConfiguration, RuntimeModelType } from "../types/configuration";
import type { DbModelConfiguration } from "../types/tables";

export async function listModels(): Promise<DbModelConfiguration[]> {
  return await db.query.modelConfiguration.findMany();
}

export async function getModelConfigForType(modelType: RuntimeModelType) {
  if (modelType === "fast") {
    const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
    if (!runtimeConfig?.fastModelId) {
      throw new Error("Fast model is not configured");
    }
    const fastModel = await db.query.modelConfiguration.findFirst({
      where: eq(modelConfiguration.id, runtimeConfig.fastModelId),
    });
    if (!fastModel) {
      throw new Error("Fatal error, fast runtime model is not found");
    }
    return fastModel;
  } else {
    const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
    if (!runtimeConfig?.accurateModelId) {
      throw new Error("Accurate model is not configured");
    }
    const accurateModel = await db.query.modelConfiguration.findFirst({
      where: eq(modelConfiguration.id, runtimeConfig.accurateModelId),
    });
    if (!accurateModel) {
      throw new Error("Fatal error, accurate runtime model is not found");
    }
    return accurateModel;
  }
}

export async function getRuntimeConfiguration(): Promise<RuntimeConfiguration> {
  const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
  if (!runtimeConfig)
    return {
      fastModel: null,
      accurateModel: null,
    };

  const currentFastModel = runtimeConfig.fastModelId
    ? await db.query.modelConfiguration.findFirst({
        where: eq(modelConfiguration.id, runtimeConfig.fastModelId),
      })
    : undefined;
  const currentAccurateModel = runtimeConfig.accurateModelId
    ? await db.query.modelConfiguration.findFirst({
        where: eq(modelConfiguration.id, runtimeConfig.accurateModelId),
      })
    : undefined;

  return {
    fastModel: currentFastModel
      ? {
          name: currentFastModel.displayName || "",
          modelId: currentFastModel.id,
        }
      : null,
    accurateModel: currentAccurateModel
      ? {
          name: currentAccurateModel.displayName || "",
          modelId: currentAccurateModel.id,
        }
      : null,
  };
}

export async function setRuntimeModel(type: RuntimeModelType, modelId: string) {
  const runtimeConfig = await db.query.runtimeConfiguration.findFirst();

  if (!runtimeConfig) {
    await db.insert(runtimeConfiguration).values({
      accurateModelId: type === "accurate" ? modelId : null,
      fastModelId: type === "fast" ? modelId : null,
    });
  } else {
    if (type === "fast") {
      await db
        .update(runtimeConfiguration)
        .set({
          fastModelId: modelId,
        })
        .where(eq(runtimeConfiguration.id, runtimeConfig.id));
    } else {
      await db
        .update(runtimeConfiguration)
        .set({
          accurateModelId: modelId,
        })
        .where(eq(runtimeConfiguration.id, runtimeConfig.id));
    }
  }
}

export const addNewModel = async (modelConfig: {
  provider: string;
  providerApiKey: string;
  modelName: string;
  displayName?: string;
  baseUrl?: string;
}) => {
  return await db
    .insert(modelConfiguration)
    .values({
      provider: modelConfig.provider,
      providerApiKey: modelConfig.providerApiKey,
      modelName: modelConfig.modelName,
      displayName: modelConfig.displayName || `${modelConfig.provider}/${modelConfig.modelName}`,
      baseUrl: modelConfig.baseUrl,
    })
    .returning();
};

export async function updateModel(
  modelId: string,
  modelConfig: {
    provider: string;
    providerApiKey: string;
    modelName: string;
    displayName?: string;
    baseUrl?: string;
  },
) {
  return await db
    .update(modelConfiguration)
    .set({
      provider: modelConfig.provider,
      providerApiKey: modelConfig.providerApiKey,
      modelName: modelConfig.modelName,
      displayName: modelConfig.displayName || `${modelConfig.provider}/${modelConfig.modelName}`,
      baseUrl: modelConfig.baseUrl,
    })
    .where(eq(modelConfiguration.id, modelId))
    .returning();
}

export async function deleteModel(modelId: string) {
  // Check if model is assigned in runtime config
  const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
  if (runtimeConfig) {
    if (runtimeConfig.fastModelId === modelId || runtimeConfig.accurateModelId === modelId) {
      throw new Error("Cannot delete model that is currently assigned in runtime configuration");
    }
  }

  return await db.delete(modelConfiguration).where(eq(modelConfiguration.id, modelId));
}
