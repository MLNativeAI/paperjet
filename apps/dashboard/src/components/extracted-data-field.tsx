import { formatValue, getFieldIcon } from "@/components/utils";

interface ExtractedDataFieldProps {
  name: string;
  value: string | number | Date | null;
}

export function ExtractedDataField({ name, value }: ExtractedDataFieldProps) {
  return (
    <div className="flex flex-col space-y-1 p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          {getFieldIcon(value)}
          {name}
        </span>
      </div>
      <div className="text-sm font-medium">{formatValue(value)}</div>
    </div>
  );
}
