import { ModelListTable } from "@/components/admin/model-list-table";
import RuntimeModelsConfig from "@/components/admin/runtime-models-config";
import { useModels } from "@/hooks/use-models";
import { useRuntimeConfig } from "@/hooks/use-runtime-config";

export default function ModelsPage() {
  const { models } = useModels();
  const { runtimeConfig, setRuntimeModel, isSettingModel } = useRuntimeConfig();

  return (
    <div className="space-y-17 pt-8">
      <RuntimeModelsConfig
        runtimeConfig={runtimeConfig}
        onSetModel={setRuntimeModel}
        isSettingModel={isSettingModel}
        availableModels={models}
      />
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">All models</h2>
          {/* <AddModelDialog /> */}
        </div>
        <ModelListTable data={models} />
      </div>
    </div>
  );
}
