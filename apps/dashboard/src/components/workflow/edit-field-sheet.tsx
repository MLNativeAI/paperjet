import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldsConfiguration } from "@paperjet/engine/types";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateWorkflowField } from "@/hooks/use-update-workflow-field";

const editFieldFormSchema = z.object({
    name: z
        .string()
        .min(1, "Field name is required")
        .regex(/^[a-z][a-z0-9_]*$/, {
            message: "Field name must be in snake_case format (lowercase letters, numbers, and underscores only, starting with a letter)",
        }),
    description: z.string().min(1, "Description is required"),
    type: z.enum(["text", "number", "date", "currency", "boolean"]),
    required: z.boolean(),
});

type EditFieldFormValues = z.infer<typeof editFieldFormSchema>;

interface EditFieldSheetProps {
    field: FieldsConfiguration[number] | null;
    workflowId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (field: FieldsConfiguration[number]) => void;
}

export default function EditFieldSheet({ field, workflowId, isOpen, onClose, onSave }: EditFieldSheetProps) {
    const updateFieldMutation = useUpdateWorkflowField();

    const form = useForm<EditFieldFormValues>({
        resolver: zodResolver(editFieldFormSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "text",
            required: false,
        },
    });

    // Update form values when field prop changes
    useEffect(() => {
        if (field) {
            form.reset({
                name: field.name,
                description: field.description,
                type: field.type,
                required: field.required,
            });
        }
    }, [field, form]);

    const onSubmit = async (values: EditFieldFormValues) => {
        if (!field) return;

        try {
            // Only send the changed fields
            const updates: any = {};
            if (values.name !== field.name) updates.name = values.name;
            if (values.description !== field.description) updates.description = values.description;
            if (values.type !== field.type) updates.type = values.type;
            if (values.required !== field.required) updates.required = values.required;

            // Only update if there are changes
            if (Object.keys(updates).length > 0) {
                await updateFieldMutation.mutateAsync({
                    workflowId,
                    fieldId: field.id,
                    updates,
                });
            }

            const updatedField = { ...field, ...values };
            onSave?.(updatedField);
            onClose();
            form.reset();
        } catch (error) {
            // Error is handled by the mutation hook
        }
    };

    if (!field) return null;

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <SheetHeader>
                            <SheetTitle>Edit field</SheetTitle>
                            <SheetDescription>Make changes to the field configuration. Click save when you're done.</SheetDescription>
                        </SheetHeader>

                        <div className="grid gap-6">
                            {/* Field Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g., invoice_number" />
                                        </FormControl>
                                        <FormDescription>Use snake_case format (lowercase letters, numbers, and underscores)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Field Type */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a field type" />
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
                                        <FormDescription>Choose the data type that best matches the field content</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Detailed description for AI extraction..." className="min-h-[100px]" />
                                        </FormControl>
                                        <FormDescription>Provide a detailed description to help the AI accurately extract this field</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Required Toggle */}
                            <FormField
                                control={form.control}
                                name="required"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Required field</FormLabel>
                                            <FormDescription>Mark this field as required in the extraction process</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <SheetFooter>
                            <Button type="submit" disabled={updateFieldMutation.isPending}>
                                {updateFieldMutation.isPending ? "Saving..." : "Save changes"}
                            </Button>
                            <SheetClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}
