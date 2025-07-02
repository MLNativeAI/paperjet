import { CheckCircle, Loader2 } from "lucide-react";

interface ProgressStepsProps {
    currentStep: "analyzing" | "extracting" | "complete";
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
    const isAnalyzing = currentStep === "analyzing";
    const isExtracting = currentStep === "extracting";

    return (
        <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Upload Complete</span>
            </div>
            <div className="h-px bg-gray-200 w-8" />
            <div className="flex items-center space-x-2">
                {isAnalyzing ? (
                    <div className="relative">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
                    </div>
                ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className={`text-sm font-medium ${isAnalyzing ? "text-blue-600" : ""}`}>{isAnalyzing ? "Analyzing..." : "Analysis"}</span>
            </div>
            <div className="h-px bg-gray-200 w-8" />
            <div className="flex items-center space-x-2">
                {isExtracting ? (
                    <div className="relative">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-pulse" />
                    </div>
                ) : isAnalyzing ? (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className={`text-sm font-medium ${isExtracting ? "text-blue-600" : ""}`}>{isExtracting ? "Extracting..." : "Extraction"}</span>
            </div>
        </div>
    );
}
