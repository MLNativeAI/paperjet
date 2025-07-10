import { zodResolver } from "@hookform/resolvers/zod";
import type { CategoriesConfiguration, TableConfiguration } from "@paperjet/engine/types";
import { toDisplayName, toSlug } from "@paperjet/engine/utils/display-name";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateWorkflowTable } from "@/hooks/use-update-workflow-table";
import EditSheetFooter from "@/components/workflow/edit-sheet-footer";

const columnSchema = z.object({
    id: z.string().optional(),
    displayName: z.string().min(1, "Column name is required"),
    description: z.string().min(1, "Description is required"),
    type: z.enum(["text", "number", "date", "currency", "boolean"]),
});

const editTableFormSchema = z.object({
    displayName: z.string().min(1, "Table name is required"),
    description: z.string().min(1, "Description is required"),
    columns: z.array(columnSchema).min(1, "At least one column is required"),
    categoryId: z.string().optional(),
});

type EditTableFormValues = z.infer<typeof editTableFormSchema>;

interface EditTableSheetProps {
    table: TableConfiguration[number] | null;
    workflowId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (table: TableConfiguration[number]) => void;
    mode?: "edit" | "create";
    categories?: CategoriesConfiguration;
}

export default function EditTableSheet({
    table,
    workflowId,
    isOpen,
    onClose,
    onSave,
    mode = "edit",
    categories,
}: EditTableSheetProps) {
    const updateTableMutation = useUpdateWorkflowTable();

    const form = useForm<EditTableFormValues>({
        resolver: zodResolver(editTableFormSchema),
        defaultValues: {
            displayName: "",
            description: "",
            columns: [{ displayName: "", description: "", type: "text" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "columns",
    });

    // Update form values when table prop changes
    useEffect(() => {
        if (mode === "edit" && table) {
            form.reset({
                displayName: toDisplayName(table.slug),
                description: table.description,
                columns: table.columns.map((col) => ({
                    id: col.id,
                    displayName: toDisplayName(col.name),
                    description: col.description,
                    type: col.type,
                })),
            });
        } else if (mode === "create") {
            form.reset({
                displayName: "",
                description: "",
                columns: [{ displayName: "", description: "", type: "text" }],
                categoryId: "",
            });
        }
    }, [table, form, mode]);

    const onSubmit = async (values: EditTableFormValues) => {
        try {
            if (mode === "create") {
                // TODO: Implement table creation when API endpoint is available
                alert(`Table creation is not yet implemented at the API level. 
        
Would create table:
- Name: ${values.displayName} (slug: ${toSlug(values.displayName)})
- Description: ${values.description}
- Columns: ${values.columns.length} columns

Please implement the POST /:id/tables API endpoint and createWorkflowTable service method.`);

                onClose();
                form.reset();
                return;
            }

            if (mode === "edit" && table) {
                // Convert display name to slug
                const newSlug = toSlug(values.displayName);

                // Only send the changed fields
                const updates: any = {};
                if (newSlug !== table.slug) updates.slug = newSlug;
                if (values.description !== table.description) updates.description = values.description;

                // Check if columns have changed
                const columnsChanged =
                    values.columns.length !== table.columns.length ||
                    values.columns.some((col, idx) => {
                        const originalCol = table.columns[idx];
                        return (
                            !originalCol ||
                            toSlug(col.displayName) !== originalCol.name ||
                            col.description !== originalCol.description ||
                            col.type !== originalCol.type
                        );
                    });

                if (columnsChanged) {
                    updates.columns = values.columns.map((col) => ({
                        id: col.id,
                        name: toSlug(col.displayName),
                        description: col.description,
                        type: col.type,
                    }));
                }

                // Only update if there are changes
                if (Object.keys(updates).length > 0) {
                    await updateTableMutation.mutateAsync({
                        workflowId,
                        tableId: table.id,
                        updates,
                    });
                }

                const updatedTable = { ...table, ...values };
                onSave?.(updatedTable);
            }

            onClose();
            form.reset();
        } catch (error) {
            // Error is handled by the mutation hook
        }
    };

    const handleAddColumn = () => {
        append({ displayName: "", description: "", type: "text" });
    };

    if (mode === "edit" && !table) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <SheetHeader>
                            <SheetTitle>{mode === "create" ? "Create table" : "Edit table"}</SheetTitle>
                            <SheetDescription>
                                {mode === "create"
                                    ? "Create a new table for extracting structured data from documents."
                                    : "Make changes to the table configuration. Click save when you're done. Run the extraction to see the changes."}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="grid gap-6 px-4 max-h-[70vh] overflow-y-auto">
                            {/* Table Name */}
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Table Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g., Line Items" />
                                        </FormControl>
                                        <FormDescription>
                                            Enter a human-readable name. It will be automatically converted to a
                                            technical identifier.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Category Selection - Only show in create mode */}
                            {mode === "create" && categories && (
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category.categoryId}
                                                            value={category.categoryId}
                                                        >
                                                            {category.displayName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Choose which section this table belongs to
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Detailed description for AI extraction..."
                                                className="min-h-[100px]"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide a detailed description to help the AI accurately extract this table
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Columns */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <FormLabel>Columns</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddColumn}>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Add Column
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Column {index + 1}</h4>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Column Name */}
                                        <FormField
                                            control={form.control}
                                            name={`columns.${index}.displayName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Column Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g., Product Name" />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Enter a human-readable name. It will be automatically converted
                                                        to a technical identifier.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Column Type */}
                                        <FormField
                                            control={form.control}
                                            name={`columns.${index}.type`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Column Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a column type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="text">Text</SelectItem>
                                                            <SelectItem value="number">Number</SelectItem>
                                                            <SelectItem value="date">Date</SelectItem>
                                                            <SelectItem value="currency">Currency</SelectItem>
                                                            <SelectItem value="boolean">Boolean</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Column Description */}
                                        <FormField
                                            control={form.control}
                                            name={`columns.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Describe what this column contains..."
                                                            className="min-h-[60px]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <EditSheetFooter
                            mode={mode}
                            isSubmitting={updateTableMutation.isPending}
                            onDelete={mode === "edit" ? () => console.log("delete") : undefined}
                            isDeleting={false}
                            submitLabel={{
                                create: "Create table",
                                edit: "Save changes",
                            }}
                            deleteLabel="Delete table"
                        />
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
