import { createFileRoute } from "@tanstack/react-router";
import WorkflowFinalizePage from "@/pages/workflow-finalize-page";

export const Route = createFileRoute("/_app/workflows/$workflowId/finalize")({
    component: WorkflowFinalizePage,
});

// function WorkflowFinalizePage() {
//     const { workflowId } = Route.useParams();
//     const navigate = Route.useNavigate();
//     const { workflow, isLoading, updateWorkflow, extractData, analysisStatus } = useWorkflow(workflowId);

//     // Redirect based on workflow status
//     useEffect(() => {
//         if (!isLoading && workflow) {
//             const status = workflow.status as WorkflowStatus;

//             // If workflow is already active, redirect to main page
//             if (status === "active") {
//                 navigate({ to: "/" });
//             }
//             // If still in draft or analyzing phase, redirect back to creator
//             else if (status === "draft" || status === "analyzing") {
//                 navigate({ to: "/workflows/new" });
//             }
//             // If status is extracting and we have fields, trigger extraction
//             else if (status === "extracting" && workflow.fileId && workflow.configuration.fields?.length > 0) {
//                 extractData.mutate({
//                     fileId: workflow.fileId,
//                     fields: workflow.configuration.fields,
//                     tables: workflow.configuration.tables || [],
//                 });
//             }
//         }
//     }, [workflow, isLoading, navigate, extractData]);

//     if (isLoading) {
//         return (
//             <div className="w-full px-4 py-8">
//                 <div className="text-center">
//                     <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
//                     <p className="text-muted-foreground">Loading workflow...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!workflow) {
//         return (
//             <div className="w-full px-4 py-8">
//                 <div className="text-center">
//                     <p className="text-red-500">Workflow not found</p>
//                     <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
//                         Back to Workflows
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     const status = workflow.status as WorkflowStatus;
//     const isExtracting = status === "extracting";
//     const isConfiguring = status === "configuring";

//     // Show loading screen during extraction
//     if (isExtracting) {
//         return (
//             <div className="w-full px-4 py-8">
//                 <div className="mb-8 text-center">
//                     <h1 className="text-3xl font-bold mb-4">Extracting Data</h1>
//                     <p className="text-muted-foreground">We're extracting data from your document using the analyzed fields...</p>
//                 </div>

//                 <div className="flex justify-center">
//                     <Card className="w-full max-w-2xl">
//                         <CardContent className="p-8">
//                             <div className="space-y-6">
//                                 <div className="flex flex-col items-center space-y-4">
//                                     <div className="relative">
//                                         <Loader2 className="h-16 w-16 animate-spin text-primary" />
//                                         <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse" />
//                                     </div>
//                                     <div className="text-center space-y-2">
//                                         <p className="text-lg font-medium">Processing Document</p>
//                                         <p className="text-sm text-muted-foreground">This may take a few moments...</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         );
//     }

//     // Show configuration UI
//     if (isConfiguring && workflow.fileId) {
//         return (
//             <div className="w-full px-4 py-8 space-y-8">
//                 {/* Header */}
//                 <div>
//                     <Button variant="ghost" onClick={() => navigate({ to: "/" })} className="mb-4">
//                         <ArrowLeft className="h-4 w-4 mr-2" />
//                         Back to Workflows
//                     </Button>
//                     <h1 className="text-3xl font-bold mb-2">Finalize Workflow</h1>
//                     <p className="text-muted-foreground">Review extracted data and save your workflow configuration.</p>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     {/* Left Panel - Document Preview */}
//                     <div className="lg:sticky lg:top-4 lg:h-fit">
//                         <DocumentPreview fileId={workflow.fileId} />
//                     </div>

//                     {/* Right Panel - Extracted Values and Save */}
//                     <div className="space-y-6">
//                         <ExtractedValues
//                             extractionResult={extractData.data?.extractionResult}
//                             fields={workflow.configuration.fields || []}
//                             tables={workflow.configuration.tables || []}
//                             isLoading={extractData.isPending}
//                             onExtractData={() => {
//                                 if (workflow.fileId && workflow.configuration.fields) {
//                                     extractData.mutate({
//                                         fileId: workflow.fileId,
//                                         fields: workflow.configuration.fields,
//                                         tables: workflow.configuration.tables || [],
//                                     });
//                                 }
//                             }}
//                         />

//                         {/* Save Workflow Card */}
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Save Workflow</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <div className="space-y-4">
//                                     <div>
//                                         <Label htmlFor="workflow-name">Workflow Name</Label>
//                                         <Input id="workflow-name" defaultValue={workflow.name} placeholder="Enter a name for your workflow" />
//                                     </div>

//                                     <div className="text-sm text-muted-foreground space-y-1">
//                                         <p>Fields configured: {workflow.configuration.fields?.length || 0}</p>
//                                         <p>Tables configured: {workflow.configuration.tables?.length || 0}</p>
//                                     </div>

//                                     <div className="flex gap-2">
//                                         <Button variant="outline" onClick={() => navigate({ to: `/workflows/${workflowId}/configure` })}>
//                                             Advanced Configuration
//                                         </Button>
//                                         <Button
//                                             className="flex-1"
//                                             onClick={() => {
//                                                 const nameInput = document.getElementById("workflow-name") as HTMLInputElement;
//                                                 const name = nameInput?.value?.trim();
//                                                 if (name) {
//                                                     updateWorkflow.mutate({
//                                                         name,
//                                                         fields: workflow.configuration.fields || [],
//                                                     });
//                                                 }
//                                             }}
//                                             disabled={updateWorkflow.isPending}
//                                         >
//                                             {updateWorkflow.isPending ? "Saving..." : "Save Workflow"}
//                                         </Button>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Fallback
//     return (
//         <div className="w-full px-4 py-8">
//             <div className="text-center">
//                 <p className="text-muted-foreground">Invalid workflow state</p>
//                 <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
//                     Back to Workflows
//                 </Button>
//             </div>
//         </div>
//     );
// }
