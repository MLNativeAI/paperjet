import { useNavigate } from "@tanstack/react-router";
import { FileText, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkflow } from "@/hooks/useWorkflow";

export default function WorkflowCreatorPage() {
    const navigate = useNavigate();
    const [_file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { createWorkflowFromFile } = useWorkflow("");

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        createWorkflowFromFile.mutate(selectedFile);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/"))) {
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

    return (
        <div className="w-full px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-4">Create New Workflow</h1>
                <p className="text-muted-foreground">
                    Upload a document to get started. We'll analyze it and suggest fields to extract.
                </p>
            </div>

            <div className="flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardContent className="p-0">
                        {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
                        <div
                            className={`rounded-lg py-12 text-center transition-colors ${
                                isDragging ? "border-primary bg-primary/5" : "border-gray-300"
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            {createWorkflowFromFile.isPending ? (
                                <div className="space-y-4">
                                    <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground" />
                                    <p className="text-muted-foreground">Creating workflow from your document...</p>
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
