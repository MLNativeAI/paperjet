import type { DbModelConfiguration, RuntimeModel } from "@paperjet/db/types";
import { BrainIcon, RocketIcon } from "lucide-react";
import ModelSelectorDropdown from "@/components/admin/model-selector-dropdown";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface RuntimeModelCardProps {
  modelType: "fast" | "accurate";
  model: RuntimeModel | null;
  onSetModel: (params: { type: "fast" | "accurate"; modelId: string }) => void;
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
  const modelNameLabel = modelType === "fast" ? "Fast Model" : "Accurate Model";
  const modelIcon = modelType === "fast" ? <RocketIcon /> : <BrainIcon />;
  const modelDesc =
    modelType === "fast"
      ? "Fast model is used for quick, inexpensive operations like parsing text or verification. We recommend using a snappy, smaller model"
      : "Accurate model is used for OCR and other complex tasks. Vision is required, we recommend using the best model you have.";

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
