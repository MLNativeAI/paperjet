import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  phase: "analyzing" | "extracting";
}

export function LoadingIndicator({ phase }: LoadingIndicatorProps) {
  const isAnalyzing = phase === "analyzing";

  return (
    <div className="text-center">
      <div className="relative mb-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
        <div className="absolute inset-2 rounded-full border-2 border-blue-200 animate-ping" />
      </div>
      <p className="text-lg font-medium text-blue-700">
        {isAnalyzing ? "Analyzing document structure..." : "Extracting data..."}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {isAnalyzing
          ? "AI is identifying fields and structure in your document"
          : "Processing extracted data with the identified fields"}
      </p>
      <div className="mt-4 flex justify-center">
        <div className="flex space-x-1">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
