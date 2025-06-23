import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkflowAnalysisResult } from "@/components/WorkflowAnalysisResult";
import { toast } from "sonner";

export default function WorkflowCreatorPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const analyzeDocument = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/workflows/analyze", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
    },
    onError: () => {
      toast.error("Failed to analyze document");
    },
  });

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    analyzeDocument.mutate(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.type.startsWith("image/"))
    ) {
      handleFileSelect(droppedFile);
    } else {
      toast.error("Please upload a PDF or image file");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  if (analysis) {
    return (
      <WorkflowAnalysisResult analysis={analysis} fileId={analysis.fileId} />
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Create New Workflow</h1>
        <p className="text-muted-foreground">
          Upload a document to get started. We'll analyze it and suggest fields
          to extract.
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-0">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {analyzeDocument.isPending ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Analyzing your document...
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Drop your document here or click to browse
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports PDF and image files (PNG, JPG, etc.)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                  />
                  <Button asChild>
                    <label htmlFor="file-input" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Select File
                    </label>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/" })}>
          Back to Workflows
        </Button>
      </div>
    </div>
  );
}
