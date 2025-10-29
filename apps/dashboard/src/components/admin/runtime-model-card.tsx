import type { DbModelConfiguration, RuntimeModel, RuntimeModelType } from "@paperjet/db/types";
import { BrainIcon, Eye } from "lucide-react";
import ModelSelectorDropdown from "@/components/admin/model-selector-dropdown";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface RuntimeModelCardProps {
  modelType: RuntimeModelType;
  model: RuntimeModel | null;
  onSetModel: (params: { type: RuntimeModelType; modelId: string }) => void;
  isSettingModel: boolean;
  availableModels: DbModelConfiguration[];
}

export default function RuntimeModelCard({
  modelType,
  model,
  onSetModel,
  isSettingModel,
  availableModels,
}: RuntimeModelCardProps) {
  const modelNameLabel = modelType === "core" ? "Core Model" : "Vision Model";
  const modelIcon = modelType === "core" ? <BrainIcon /> : <Eye />;
  const modelDesc =
    modelType === "core"
      ? "Code model is used for logical operations like data extraction, processing and reasoning."
      : "Vision model is used for OCR and other visual tasks.";

  const displayName = model?.name || "Not set";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardDescription>{modelNameLabel}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex gap-2 items-center">
          {modelIcon}
          {displayName}
        </CardTitle>
        <CardAction>
          <ModelSelectorDropdown
            currentModel={model}
            availableModels={availableModels}
            onSelectModel={(modelId: string) => onSetModel({ type: modelType, modelId })}
            isSettingModel={isSettingModel}
          />
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-muted-foreground">{modelDesc}</div>
      </CardFooter>
    </Card>
  );
}
