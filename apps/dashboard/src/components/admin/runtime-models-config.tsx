import type { DbModelConfiguration, RuntimeConfiguration, RuntimeModelType } from "@paperjet/db/types";
import RuntimeModelCard from "@/components/admin/runtime-model-card";

interface RuntimeModelsConfigProps {
  runtimeConfig: RuntimeConfiguration;
  onSetModel: (params: { type: RuntimeModelType; modelId: string }) => void;
  isSettingModel: boolean;
  availableModels: DbModelConfiguration[];
}

export default function RuntimeModelsConfig({
  runtimeConfig,
  onSetModel,
  isSettingModel,
  availableModels,
}: RuntimeModelsConfigProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Runtime models</h2>
      </div>
      <div className="flex gap-4">
        <RuntimeModelCard
          modelType="core"
          model={runtimeConfig.coreModel}
          onSetModel={onSetModel}
          isSettingModel={isSettingModel}
          availableModels={availableModels}
        />
        <RuntimeModelCard
          modelType="vision"
          model={runtimeConfig.visionModel}
          onSetModel={onSetModel}
          isSettingModel={isSettingModel}
          availableModels={availableModels}
        />
      </div>
    </div>
  );
}
