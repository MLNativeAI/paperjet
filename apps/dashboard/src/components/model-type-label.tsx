import type { RuntimeModelType } from "@paperjet/db/types";
import { BrainIcon, RocketIcon } from "lucide-react";

export default function ModelTypeLabel({ type }: { type: RuntimeModelType }) {
  const modelNameLabel = type === "fast" ? "Fast Model" : "Accurate Model";
  const modelIcon = type === "fast" ? <RocketIcon /> : <BrainIcon />;
  return (
    <div className="text-lg flex gap-2 items-center">
      {modelIcon}
      {modelNameLabel}
    </div>
  );
}
