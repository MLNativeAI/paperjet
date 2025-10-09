import type { DbModelConfiguration, RuntimeModel } from "@paperjet/db/types";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModelSelectorDropdownProps {
  currentModel: RuntimeModel | null;
  availableModels: DbModelConfiguration[];
  onSelectModel: (modelId: string) => void;
  isSettingModel: boolean;
}

export default function ModelSelectorDropdown({
  currentModel,
  availableModels,
  onSelectModel,
  isSettingModel,
}: ModelSelectorDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" disabled={isSettingModel} className="gap-2">
          {isSettingModel ? "Setting..." : "Configure"}
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            disabled={isSettingModel}
            className="flex items-center justify-between"
          >
            <span>{model.displayName || model.modelName}</span>
            {currentModel?.modelId === model.id && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        {availableModels.length === 0 && <DropdownMenuItem disabled>No models available</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
