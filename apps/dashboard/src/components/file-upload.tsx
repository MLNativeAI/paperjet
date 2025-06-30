import { FileText, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileUploadProps {
    onFileUpload: (files: FileList) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                onFileUpload(files);
            }
        },
        [onFileUpload],
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                onFileUpload(e.target.files);
            }
        },
        [onFileUpload],
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Documents</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                    Upload documents to process with this workflow. Supports PDF and image files.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                {/** biome-ignore lint/a11y/noStaticElementInteractions: drag and drop functionality requires these interactions */}
                <div
                    className={`rounded-lg py-12 text-center transition-colors ${
                        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Drop your documents here or click to browse</h3>
                    <p className="text-sm text-muted-foreground mb-4">Supports PDF and image files (PNG, JPG, etc.)</p>
                    <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        id="file-input"
                        multiple
                    />
                    <Button asChild>
                        <label htmlFor="file-input" className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            Select Files
                        </label>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
