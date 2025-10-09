import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentPreview } from "@/hooks/use-document-preview";

export function DocumentPreview({ workflowExecutionId }: { workflowExecutionId: string }) {
  const { documentUrl, isLoading, error } = useDocumentPreview(workflowExecutionId);
  if (isLoading) {
    return null;
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
            <p className="text-sm text-muted-foreground">Failed to load document</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px] md:h-[1000px] w-full">
          {<iframe src={documentUrl} className="w-full h-full border-0 rounded-b-lg" title="Document Preview" />}
        </div>
      </CardContent>
    </Card>
  );
}
