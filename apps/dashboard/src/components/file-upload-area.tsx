import { FileText, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
}

export function FileUploadArea({ onFileSelect }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/"))) {
      onFileSelect(droppedFile);
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
      onFileSelect(selectedFile);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        {/** biome-ignore lint/a11y/noStaticElementInteractions: drag and drop functionality requires these interactions */}
        <div
          className={`rounded-lg py-12 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Drop your document here or click to browse</h3>
          <p className="text-sm text-muted-foreground mb-4">Supports PDF and image files (PNG, JPG, etc.)</p>
          <input type="file" accept=".pdf,image/*" onChange={handleFileInput} className="hidden" id="file-input" />
          <Button asChild>
            <label htmlFor="file-input" className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              Select File
            </label>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
