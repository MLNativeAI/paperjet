import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CategoriesConfiguration,
  FieldsConfiguration,
} from "@paperjet/engine/types";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWorkflowField } from "@/hooks/use-create-workflow-field";
import { useDeleteWorkflowField } from "@/hooks/use-delete-workflow-field";
import { useUpdateWorkflowField } from "@/hooks/use-update-workflow-field";

const baseFieldFormSchema = z.object({
  name: z
    .string()
    .min(1, "Field name is required")
    .regex(/^[a-z][a-z0-9_]*$/, {
      message:
        "Field name must be in snake_case format (lowercase letters, numbers, and underscores only, starting with a letter)",
    }),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["text", "number", "date", "currency", "boolean"]),
  required: z.boolean(),
});

const createFieldFormSchema = baseFieldFormSchema.extend({
  categoryId: z.string().min(1, "Category is required"),
});

const editFieldFormSchema = baseFieldFormSchema.extend({
  categoryId: z.string().optional(),
});

type EditFieldFormValues = z.infer<typeof editFieldFormSchema>;
type CreateFieldFormValues = z.infer<typeof createFieldFormSchema>;

interface EditFieldSheetProps {
  field: FieldsConfiguration[number] | null;
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (field: FieldsConfiguration[number]) => void;
  mode?: "edit" | "create";
  categories?: CategoriesConfiguration; // Required for create mode
}

export default function EditFieldSheet({
  field,
  workflowId,
  isOpen,
  onClose,
  onSave,
  mode = "edit",
  categories,
}: EditFieldSheetProps) {
  const updateFieldMutation = useUpdateWorkflowField();
  const createFieldMutation = useCreateWorkflowField();
  const deleteFieldMutation = useDeleteWorkflowField();

  const form = useForm<EditFieldFormValues | CreateFieldFormValues>({
    resolver: zodResolver(
      mode === "create" ? createFieldFormSchema : editFieldFormSchema,
    ),
    defaultValues: {
      name: "",
      description: "",
      type: "text",
      required: false,
      categoryId: "",
    },
  });

  // Update form values when field prop changes or mode changes
  useEffect(() => {
    if (mode === "edit" && field) {
      form.reset({
        name: field.name,
        description: field.description,
        type: field.type,
        required: field.required,
        categoryId: field.categoryId,
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        description: "",
        type: "text",
        required: false,
        categoryId: categories?.[0]?.categoryId || "",
      });
    }
  }, [field, form, mode, categories]);

  const onSubmit = async (
    values: EditFieldFormValues | CreateFieldFormValues,
  ) => {
    try {
      if (mode === "create") {
        if (!values.categoryId) {
          console.error("Category ID is required for creating a field");
          return;
        }

        const result = await createFieldMutation.mutateAsync({
          workflowId,
          field: {
            name: values.name,
            description: values.description,
            type: values.type,
            required: values.required,
            categoryId: values.categoryId,
          },
        });

        if (result?.field) {
          onSave?.(result.field);
        }
      } else if (mode === "edit" && field) {
        // Only send the changed fields
        const updates: any = {};
        if (values.name !== field.name) updates.name = values.name;
        if (values.description !== field.description)
          updates.description = values.description;
        if (values.type !== field.type) updates.type = values.type;
        if (values.required !== field.required)
          updates.required = values.required;

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
      }

      onClose();
      form.reset();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleDelete = async () => {
    if (mode === "edit" && field) {
      if (
        confirm(`Are you sure you want to delete the field "${field.name}"?`)
      ) {
        try {
          await deleteFieldMutation.mutateAsync({
            workflowId,
            fieldId: field.id,
          });
          onClose();
          form.reset();
        } catch (error) {
          // Error is handled by the mutation hook
        }
      }
    }
  };

  if (mode === "edit" && !field) return null;
  if (mode === "create" && !categories) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <SheetHeader>
              <SheetTitle>
                {mode === "create" ? "Add new field" : "Edit field"}
              </SheetTitle>
              <SheetDescription>
                {mode === "create"
                  ? "Create a new field for data extraction. Provide details to help the AI accurately extract this field."
                  : "Make changes to the field configuration. Click save when you're done. Run the extraction to see the changes."}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-6 px-4">
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
                    <FormDescription>
                      Use snake_case format (lowercase letters, numbers, and
                      underscores)
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                        Choose which section this field belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Field Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                    <FormDescription>
                      Choose the data type that best matches the field content
                    </FormDescription>
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
                      <Textarea
                        {...field}
                        placeholder="Detailed description for AI extraction..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description to help the AI accurately
                      extract this field
                    </FormDescription>
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
                      <FormLabel className="text-base">
                        Required field
                      </FormLabel>
                      <FormDescription>
                        Mark this field as required in the extraction process
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="flex sm:justify-between">
              <div>
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteFieldMutation.isPending}
                  >
                    {deleteFieldMutation.isPending
                      ? "Deleting..."
                      : "Delete field"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <SheetClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  disabled={
                    mode === "create"
                      ? createFieldMutation.isPending
                      : updateFieldMutation.isPending
                  }
                >
                  {mode === "create"
                    ? createFieldMutation.isPending
                      ? "Creating..."
                      : "Create field"
                    : updateFieldMutation.isPending
                      ? "Saving..."
                      : "Save changes"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
