import { Grid, LayoutPanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "grid" | "split";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="h-8 px-3"
      >
        <Grid className="h-4 w-4 mr-1" />
        Grid
      </Button>
      <Button
        variant={viewMode === "split" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("split")}
        className="h-8 px-3"
      >
        <LayoutPanelLeft className="h-4 w-4 mr-1" />
        Split
      </Button>
    </div>
  );
}
