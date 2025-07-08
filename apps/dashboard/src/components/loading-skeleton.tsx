import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoadingSkeleton() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Extracted Values</span>
          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => index).map((index) => (
            <div key={`skeleton-field-${index}`} className="border-l-4 border-l-blue-500 bg-muted/50 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse mb-2" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
          <div className="text-center py-4">
            <div className="relative mb-2">
              <div className="h-8 w-8 rounded-full border-4 border-blue-200 mx-auto animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent mx-auto animate-spin" />
            </div>
            <p className="text-sm text-blue-600 font-medium">Extracting data...</p>
            <p className="text-xs text-muted-foreground mt-1">AI is processing your document</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
