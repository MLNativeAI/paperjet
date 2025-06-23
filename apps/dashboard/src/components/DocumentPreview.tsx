import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";

interface DocumentPreviewProps {
  fileId: string;
}

export function DocumentPreview({ fileId }: DocumentPreviewProps) {
  const {
    data: documentData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document", fileId],
    queryFn: async () => {
      const response = await api.workflows[":fileId"].document.$get({
        param: { fileId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }

      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Failed to load document
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!documentData) {
    return null;
  }

  const isPdf = documentData.filename.toLowerCase().endsWith(".pdf");
  const isImage = documentData.filename
    .toLowerCase()
    .match(/\.(jpg|jpeg|png|gif|webp)$/);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPdf ? (
            <FileText className="h-5 w-5" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
          Document Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] md:h-[800px] w-full">
          {isPdf ? (
            <iframe
              src={documentData.presignedUrl}
              className="w-full h-full border-0 rounded-b-lg"
              title="Document Preview"
            />
          ) : isImage ? (
            <img
              src={documentData.presignedUrl}
              alt="Document Preview"
              className="w-full h-full object-contain rounded-b-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {documentData.filename}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
