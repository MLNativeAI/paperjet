import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle, Database, FileSearch, Loader2, Settings, Upload } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWorkflow } from "@/hooks/useWorkflow";

interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    status: "completed" | "in-progress" | "pending";
}

export default function WorkflowLoadingPage() {
    const navigate = useNavigate();
    const { workflowId } = useParams({
        from: "/_app/workflows/$workflowId/loading",
    });

    const { workflow } = useWorkflow(workflowId);

    // Auto-navigate when workflow reaches configuring state
    useEffect(() => {
        if (workflow?.status === "configuring") {
            setTimeout(() => {
                navigate({ to: `/workflows/${workflowId}/finalize` });
            }, 2000); // Show completed state for 2 seconds before navigating
        }
    }, [workflow?.status, workflowId, navigate]);

    const getWorkflowSteps = (status: string | undefined): WorkflowStep[] => {
        return [
            {
                id: "upload",
                title: "Upload Document",
                description: "Document successfully uploaded",
                icon: Upload,
                status: "completed", // Always completed since user has uploaded
            },
            {
                id: "analyze",
                title: "Analyzing Document",
                description: "Extracting document structure and identifying fields",
                icon: FileSearch,
                status: status === "analyzing" ? "in-progress" : "completed",
            },
            {
                id: "extract",
                title: "Data Extraction",
                description: "Extracting data based on identified patterns",
                icon: Database,
                status: status === "extracting" ? "in-progress" : status === "analyzing" ? "pending" : "completed",
            },
            {
                id: "configure",
                title: "Review and finalize",
                description: "Review, customize and save your workflow",
                icon: Settings,
                status: status === "configuring" ? "in-progress" : status === "analyzing" || status === "extracting" ? "pending" : "completed",
            },
        ];
    };

    const steps = getWorkflowSteps(workflow?.status);
    const completedSteps = steps.filter((step) => step.status === "completed").length;
    const progressPercentage = (completedSteps / steps.length) * 100;

    const getStepIcon = (step: WorkflowStep) => {
        const IconComponent = step.icon;

        if (step.status === "completed") {
            return <CheckCircle className="h-6 w-6 text-green-600" />;
        } else if (step.status === "in-progress") {
            return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
        } else {
            return <IconComponent className="h-6 w-6 text-gray-400" />;
        }
    };

    const getStepBadge = (step: WorkflowStep) => {
        if (step.status === "completed") {
            return (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    Completed
                </Badge>
            );
        } else if (step.status === "in-progress") {
            return (
                <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                    In Progress
                </Badge>
            );
        } else {
            return <Badge variant="secondary">Pending</Badge>;
        }
    };

    return (
        <div className="w-full px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Processing Your Workflow</h1>
                    <p className="text-muted-foreground mb-6">We're analyzing your document and setting up your workflow. This usually takes a few moments.</p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto mb-8">
                        <Progress value={progressPercentage} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                            Step {completedSteps} of {steps.length} completed
                        </p>
                    </div>
                </div>

                {/* Steps */}
                <Card>
                    <CardHeader>
                        <CardTitle>Workflow Setup Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center space-x-4">
                                {/* Step Number/Icon */}
                                <div className="flex-shrink-0">{getStepIcon(step)}</div>

                                {/* Step Content */}
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-medium ${step.status === "completed" ? "text-green-700" : step.status === "in-progress" ? "text-blue-700" : "text-gray-500"}`}>
                                            {step.title}
                                        </h3>
                                        {getStepBadge(step)}
                                    </div>
                                    <p className={`text-sm ${step.status === "pending" ? "text-gray-400" : "text-muted-foreground"}`}>{step.description}</p>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && <div className="absolute left-6 mt-8 w-0.5 h-6 bg-gray-200" />}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
