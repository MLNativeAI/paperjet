import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	ArrowLeft,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Clock,
	Download,
	Eye,
	FileText,
	Play,
	Upload,
	XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";

interface UploadedFile {
	file: File;
	id: string;
	status: "pending" | "processing" | "completed" | "failed";
	result?: any;
	error?: string;
}

export default function WorkflowExecutorPage() {
	const { workflowId } = useParams({ from: "/_app/workflows/$workflowId/run" });
	const navigate = useNavigate();
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [executionId, setExecutionId] = useState<string | null>(null);
	const [expandedResults, setExpandedResults] = useState<Set<string>>(
		new Set(),
	);

	// Fetch workflow details
	const { data: workflow, isLoading: workflowLoading } = useQuery({
		queryKey: ["workflow", workflowId],
		queryFn: async () => {
			const response = await api.workflows[":id"].$get({
				param: { id: workflowId },
			});
			if (!response.ok) {
				throw new Error("Failed to fetch workflow");
			}
			return response.json();
		},
	});

	// Execute workflow mutation
	const executeWorkflow = useMutation({
		mutationFn: async (files: File[]) => {
			const formData = new FormData();
			files.forEach((file) => formData.append("files", file));

			const response = await fetch(`/api/workflows/${workflowId}/execute`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Failed to execute workflow");
			}

			return response.json();
		},
		onSuccess: (data) => {
			setExecutionId(data.executionId);
			toast.success("Workflow execution completed!");

			// Update uploaded files with results
			setUploadedFiles((prev) =>
				prev.map((f) => {
					const result = data.files.find(
						(df: any) => df.filename === f.file.name,
					);
					return {
						...f,
						status: result?.status || "failed",
						result: result?.extractionResult,
						error: result?.error,
					};
				}),
			);
		},
		onError: (error) => {
			toast.error("Failed to execute workflow");
			console.error("Execution error:", error);
		},
	});

	const handleFileUpload = useCallback((files: FileList) => {
		const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
			file,
			id: crypto.randomUUID(),
			status: "pending",
		}));

		setUploadedFiles((prev) => [...prev, ...newFiles]);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);

			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFileUpload(files);
			}
		},
		[handleFileUpload],
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
				handleFileUpload(e.target.files);
			}
		},
		[handleFileUpload],
	);

	const removeFile = useCallback((fileId: string) => {
		setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
	}, []);

	const startExecution = useCallback(() => {
		if (uploadedFiles.length === 0) {
			toast.error("Please upload at least one file");
			return;
		}

		// Update all files to processing status
		setUploadedFiles((prev) =>
			prev.map((f) => ({ ...f, status: "processing" as const })),
		);

		executeWorkflow.mutate(uploadedFiles.map((f) => f.file));
	}, [uploadedFiles, executeWorkflow]);

	const getStatusIcon = (status: UploadedFile["status"]) => {
		switch (status) {
			case "pending":
				return <Clock className="h-4 w-4 text-muted-foreground" />;
			case "processing":
				return (
					<div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
				);
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "failed":
				return <XCircle className="h-4 w-4 text-red-600" />;
		}
	};

	const getStatusColor = (status: UploadedFile["status"]) => {
		switch (status) {
			case "pending":
				return "secondary";
			case "processing":
				return "default";
			case "completed":
				return "default";
			case "failed":
				return "destructive";
		}
	};

	const toggleResultExpansion = useCallback((fileId: string) => {
		setExpandedResults((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(fileId)) {
				newSet.delete(fileId);
			} else {
				newSet.add(fileId);
			}
			return newSet;
		});
	}, []);

	const renderExtractionResults = useCallback((result: any, fileId: string) => {
		if (!result) return null;

		try {
			const parsedResult =
				typeof result === "string" ? JSON.parse(result) : result;
			const { fields = [], tables = [] } = parsedResult;

			return (
				<div className="space-y-4">
					{/* Fields */}
					{fields.length > 0 && (
						<div>
							<h4 className="font-medium mb-2">Extracted Fields</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{fields.map((field: any, index: number) => (
									<div key={index} className="p-3 border rounded-lg">
										<div className="flex items-center justify-between mb-1">
											<span className="text-sm font-medium text-muted-foreground">
												{field.name || field.fieldName}
											</span>
										</div>
										<div className="text-sm">
											{field.value !== null && field.value !== undefined ? (
												<span className="font-medium">
													{String(field.value)}
												</span>
											) : (
												<span className="text-muted-foreground italic">
													Not found
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Tables */}
					{tables.length > 0 && (
						<div>
							<h4 className="font-medium mb-2">Extracted Tables</h4>
							<div className="space-y-4">
								{tables.map((table: any, tableIndex: number) => (
									<div key={tableIndex} className="border rounded-lg">
										<div className="p-3 border-b bg-muted/50">
											<h5 className="font-medium">
												{table.name || table.tableName}
											</h5>
											<p className="text-sm text-muted-foreground">
												{table.rows?.length || 0} rows
											</p>
										</div>
										{table.rows && table.rows.length > 0 && (
											<div className="overflow-x-auto">
												<Table>
													<TableHeader>
														<TableRow>
															{Object.keys(
																table.rows[0].values || table.rows[0],
															).map((key: string) => (
																<TableHead key={key} className="text-xs">
																	{key
																		.replace(/_/g, " ")
																		.replace(/\b\w/g, (l) => l.toUpperCase())}
																</TableHead>
															))}
														</TableRow>
													</TableHeader>
													<TableBody>
														{table.rows.map((row: any, rowIndex: number) => (
															<TableRow key={rowIndex}>
																{Object.entries(row.values || row).map(
																	([key, value]: [string, any]) => (
																		<TableCell key={key} className="text-xs">
																			{value !== null && value !== undefined
																				? String(value)
																				: "-"}
																		</TableCell>
																	),
																)}
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			);
		} catch (error) {
			return (
				<div className="p-3 text-sm text-red-600 bg-red-50 rounded">
					Error parsing results:{" "}
					{error instanceof Error ? error.message : "Unknown error"}
				</div>
			);
		}
	}, []);

	const exportResults = useCallback(() => {
		const results = uploadedFiles
			.filter((f) => f.status === "completed" && f.result)
			.map((f) => ({
				filename: f.file.name,
				extractionResult: f.result,
			}));

		const dataStr = JSON.stringify(results, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);

		const link = document.createElement("a");
		link.href = url;
		link.download = `workflow-execution-${executionId || "results"}.json`;
		link.click();

		URL.revokeObjectURL(url);
	}, [uploadedFiles, executionId]);

	if (workflowLoading) {
		return (
			<div className="w-full px-4 py-8">
				<div className="flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
					<span className="ml-2">Loading workflow...</span>
				</div>
			</div>
		);
	}

	if (!workflow) {
		return (
			<div className="w-full px-4 py-8">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Workflow not found</h1>
					<Button onClick={() => navigate({ to: "/" })}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Workflows
					</Button>
				</div>
			</div>
		);
	}

	const config = workflow.configuration;
	const completedFiles = uploadedFiles.filter(
		(f) => f.status === "completed",
	).length;
	const failedFiles = uploadedFiles.filter((f) => f.status === "failed").length;
	const processingFiles = uploadedFiles.filter(
		(f) => f.status === "processing",
	).length;
	const allCompleted = uploadedFiles.length > 0 && processingFiles === 0;

	return (
		<div className="w-full px-4 py-8 space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<Button
						variant="ghost"
						onClick={() => navigate({ to: "/" })}
						className="mb-4"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Workflows
					</Button>
					<h1 className="text-3xl font-bold">Execute Workflow</h1>
					<div className="flex items-center gap-2 mt-2">
						<span className="text-muted-foreground">{workflow.name}</span>
						<Badge variant="secondary">{workflow.documentType}</Badge>
					</div>
				</div>

				{allCompleted && completedFiles > 0 && (
					<div className="flex gap-2">
						<Button variant="outline" onClick={exportResults}>
							<Download className="h-4 w-4 mr-2" />
							Export Results
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								navigate({ to: `/workflows/${workflowId}/history` })
							}
						>
							<Eye className="h-4 w-4 mr-2" />
							View History
						</Button>
					</div>
				)}
			</div>

			{/* Workflow Info */}
			<Card>
				<CardHeader>
					<CardTitle>Workflow Configuration</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Document Type
							</p>
							<p className="text-lg">{workflow.documentType}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Fields to Extract
							</p>
							<p className="text-lg">{config.fields?.length || 0} fields</p>
						</div>
						<div>
							<p className="text-sm font-medium text-muted-foreground">
								Tables to Extract
							</p>
							<p className="text-lg">{config.tables?.length || 0} tables</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* File Upload */}
			<Card>
				<CardHeader>
					<CardTitle>Upload Documents</CardTitle>
				</CardHeader>
				<CardContent>
					<div
						className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
							isDragging
								? "border-primary bg-primary/5"
								: "border-muted-foreground/25"
						}`}
						onDrop={handleDrop}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
					>
						<Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-lg font-semibold mb-2">
							Drop {workflow.documentType.toLowerCase()} files here or click to
							browse
						</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Supports PDF and image files
						</p>
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

			{/* Uploaded Files */}
			{uploadedFiles.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Uploaded Files ({uploadedFiles.length})</span>
							{processingFiles === 0 && (
								<Button
									onClick={startExecution}
									disabled={
										executeWorkflow.isPending || uploadedFiles.length === 0
									}
								>
									<Play className="h-4 w-4 mr-2" />
									Execute Workflow
								</Button>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{uploadedFiles.map((uploadedFile) => (
								<div key={uploadedFile.id} className="border rounded-lg">
									<div className="flex items-center justify-between p-3">
										<div className="flex items-center gap-3">
											{getStatusIcon(uploadedFile.status)}
											<div>
												<p className="font-medium">{uploadedFile.file.name}</p>
												<p className="text-sm text-muted-foreground">
													{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Badge variant={getStatusColor(uploadedFile.status)}>
												{uploadedFile.status}
											</Badge>

											{uploadedFile.status === "completed" &&
												uploadedFile.result && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															toggleResultExpansion(uploadedFile.id)
														}
													>
														{expandedResults.has(uploadedFile.id) ? (
															<>
																<ChevronDown className="h-4 w-4 mr-1" />
																Hide Results
															</>
														) : (
															<>
																<ChevronRight className="h-4 w-4 mr-1" />
																View Results
															</>
														)}
													</Button>
												)}

											{uploadedFile.status === "pending" && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => removeFile(uploadedFile.id)}
												>
													Remove
												</Button>
											)}

											{uploadedFile.status === "failed" &&
												uploadedFile.error && (
													<div className="text-sm text-red-600 max-w-xs truncate">
														{uploadedFile.error}
													</div>
												)}
										</div>
									</div>

									{/* Results Section */}
									{uploadedFile.status === "completed" &&
										uploadedFile.result &&
										expandedResults.has(uploadedFile.id) && (
											<div className="border-t p-4 bg-muted/20">
												{renderExtractionResults(
													uploadedFile.result,
													uploadedFile.id,
												)}
											</div>
										)}
								</div>
							))}
						</div>

						{/* Progress Summary */}
						{processingFiles > 0 && (
							<div className="mt-4 p-4 bg-muted rounded-lg">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium">
										Processing Progress
									</span>
									<span className="text-sm text-muted-foreground">
										{completedFiles + failedFiles} of {uploadedFiles.length}{" "}
										completed
									</span>
								</div>
								<Progress
									value={
										((completedFiles + failedFiles) / uploadedFiles.length) *
										100
									}
									className="w-full"
								/>
							</div>
						)}

						{/* Results Summary */}
						{allCompleted && (
							<div className="mt-4 p-4 bg-muted rounded-lg">
								<h4 className="font-medium mb-2">Execution Summary</h4>
								<div className="grid grid-cols-3 gap-4 text-sm">
									<div>
										<span className="text-green-600 font-medium">
											{completedFiles}
										</span>
										<span className="text-muted-foreground"> successful</span>
									</div>
									<div>
										<span className="text-red-600 font-medium">
											{failedFiles}
										</span>
										<span className="text-muted-foreground"> failed</span>
									</div>
									<div>
										<span className="text-muted-foreground font-medium">
											{uploadedFiles.length}
										</span>
										<span className="text-muted-foreground"> total</span>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
