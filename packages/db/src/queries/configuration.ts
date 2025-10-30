import { eq } from "drizzle-orm";
import { db } from "../db";
import { modelConfiguration, runtimeConfiguration } from "../schema";
import type { RuntimeConfiguration, RuntimeModelType } from "../types/configuration";
import type { DbModelConfiguration } from "../types/tables";

export async function listModels(): Promise<DbModelConfiguration[]> {
  return await db.query.modelConfiguration.findMany();
}

export async function getModelConfigForType(modelType: RuntimeModelType) {
  if (modelType === "core") {
    const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
    if (!runtimeConfig?.coreModelId) {
      throw new Error("Fast model is not configured");
    }
    const coreModel = await db.query.modelConfiguration.findFirst({
      where: eq(modelConfiguration.id, runtimeConfig.coreModelId),
    });
    if (!coreModel) {
      throw new Error("Fatal error, fast runtime model is not found");
    }
    return coreModel;
  } else {
    const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
    if (!runtimeConfig?.visionModelId) {
      throw new Error("Vision model is not configured");
    }
    const visionModel = await db.query.modelConfiguration.findFirst({
      where: eq(modelConfiguration.id, runtimeConfig.visionModelId),
    });
    if (!visionModel) {
      throw new Error("Fatal error, accurate runtime model is not found");
    }
    return visionModel;
  }
}

export async function getRuntimeConfiguration(): Promise<RuntimeConfiguration> {
  const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
  if (!runtimeConfig)
    return {
      coreModel: null,
      visionModel: null,
    };

  const codeModelData = runtimeConfig.coreModelId
    ? await db.query.modelConfiguration.findFirst({
        where: eq(modelConfiguration.id, runtimeConfig.coreModelId),
      })
    : undefined;
  const visionModelData = runtimeConfig.visionModelId
    ? await db.query.modelConfiguration.findFirst({
        where: eq(modelConfiguration.id, runtimeConfig.visionModelId),
      })
    : undefined;

  return {
    coreModel: codeModelData
      ? {
          name: codeModelData.displayName || "",
          modelId: codeModelData.id,
        }
      : null,
    visionModel: visionModelData
      ? {
          name: visionModelData.displayName || "",
          modelId: visionModelData.id,
        }
      : null,
  };
}

export async function setRuntimeModel(type: RuntimeModelType, modelId: string) {
  const runtimeConfig = await db.query.runtimeConfiguration.findFirst();

  if (!runtimeConfig) {
    await db.insert(runtimeConfiguration).values({
      coreModelId: type === "core" ? modelId : null,
      visionModelId: type === "vision" ? modelId : null,
    });
  } else {
    if (type === "core") {
      await db
        .update(runtimeConfiguration)
        .set({
          coreModelId: modelId,
        })
        .where(eq(runtimeConfiguration.id, runtimeConfig.id));
    } else {
      await db
        .update(runtimeConfiguration)
        .set({
          visionModelId: modelId,
        })
        .where(eq(runtimeConfiguration.id, runtimeConfig.id));
    }
  }
}

export const addNewModel = async (modelConfig: {
  provider: string;
  providerApiKey: string;
  modelName: string;
  isCore: boolean;
  isVision: boolean;
  displayName?: string;
  baseUrl?: string;
}) => {
  const result = await db
    .insert(modelConfiguration)
    .values({
      provider: modelConfig.provider,
      providerApiKey: modelConfig.providerApiKey,
      modelName: modelConfig.modelName,
      displayName: modelConfig.displayName || `${modelConfig.provider}/${modelConfig.modelName}`,
      baseUrl: modelConfig.baseUrl,
      isCore: modelConfig.isCore,
      isVision: modelConfig.isVision,
    })
    .returning();

  if (result.length === 0) {
    throw new Error("Failed to create model");
  }

  const newModel = result[0];

  if (!newModel) {
    throw new Error("Model data missing");
  }

  // Auto-assign as runtime model if it's the first model of that type
  const runtimeConfig = await db.query.runtimeConfiguration.findFirst();

  if (modelConfig.isCore && !runtimeConfig?.coreModelId) {
    await setRuntimeModel("core", newModel.id);
  }

  if (modelConfig.isVision && !runtimeConfig?.visionModelId) {
    await setRuntimeModel("vision", newModel.id);
  }

  return result;
};

export type ModelConfigParams = {
  provider: "custom" | "google" | "openai" | "openrouter";
  providerApiKey: string;
  modelName: string;
  isCore: boolean;
  isVision: boolean;
  displayName?: string | undefined;
  baseUrl?: string | undefined;
};

export async function updateModel(modelId: string, modelConfig: ModelConfigParams) {
  return await db
    .update(modelConfiguration)
    .set({
      provider: modelConfig.provider,
      providerApiKey: modelConfig.providerApiKey,
      modelName: modelConfig.modelName,
      displayName: modelConfig.displayName || `${modelConfig.provider}/${modelConfig.modelName}`,
      baseUrl: modelConfig.baseUrl,
      isCore: modelConfig.isCore,
      isVision: modelConfig.isVision,
    })
    .where(eq(modelConfiguration.id, modelId))
    .returning();
}

export async function deleteModel(modelId: string) {
  // Check if model is assigned in runtime config
  const runtimeConfig = await db.query.runtimeConfiguration.findFirst();
  if (runtimeConfig) {
    if (runtimeConfig.coreModelId === modelId || runtimeConfig.visionModelId === modelId) {
      throw new Error("Cannot delete model that is currently assigned in runtime configuration");
    }
  }

  return await db.delete(modelConfiguration).where(eq(modelConfiguration.id, modelId));
}
