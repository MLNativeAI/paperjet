import { zodResolver } from "@hookform/resolvers/zod";
import type { DbModelConfiguration } from "@paperjet/db/types";
import { type ConnectionValidationResult, type ModelConfigParams, modelConfigSchema } from "@paperjet/engine/types";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useModelConfiguration } from "@/hooks/use-model-configuration";

export default function AddEditModelForm({
  setDialogOpen,
  model,
}: {
  setDialogOpen: (open: boolean) => void;
  model?: DbModelConfiguration;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ConnectionValidationResult | null>(null);

  const { validateConnection, addModel, updateModel } = useModelConfiguration();

  const form = useForm<ModelConfigParams>({
    resolver: zodResolver(modelConfigSchema),
    defaultValues: {
      provider: "google",
      isCore: false,
      isVision: false,
    },
  });

  useEffect(() => {
    if (model) {
      form.reset({
        provider: (model.provider as "google" | "openai" | "openrouter" | "custom") || "google",
        providerApiKey: model.providerApiKey || "",
        modelName: model.modelName || "",
        displayName: model.displayName || "",
        baseUrl: model.baseUrl || "",
        isCore: model.isCore ?? false,
        isVision: model.isVision ?? false,
      });
    }
  }, [model, form]);
  const watchedProvider = form.watch("provider");

  const runConnectionValidation = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setValidationResult(null);
    const values = form.getValues();

    validateConnection.mutate(values, {
      onSuccess: (result) => {
        setValidationResult(result);
      },
      onError: (error) => {
        setValidationResult({
          isValid: false,
          error: error.message || "Failed to validate connection",
        });
      },
    });
  };

  const onSubmit = async (values: ModelConfigParams) => {
    setIsLoading(true);
    try {
      if (model) {
        updateModel.mutate({ id: model.id, config: values });
        toast.success("Model configuration updated successfully");
      } else {
        addModel.mutate(values);
        toast.success("Model configuration added successfully");
        form.reset();
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(`Failed to ${model ? "update" : "add"} model configuration`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="custom">Custom (OpenAI-compatible)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchedProvider === "custom" && (
          <FormField
            control={form.control}
            name="baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://api.provider.com/v1" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="providerApiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input placeholder="Enter your API key" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="modelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., gemini-1.5-flash" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Gemini 1.5 Flash" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Select at least one model type (Core or Vision) for this model configuration.
          </div>
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="isCore"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Core Model</FormLabel>
                    <div className="text-xs text-muted-foreground">Used for general document processing tasks</div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isVision"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Vision Model</FormLabel>
                    <div className="text-xs text-muted-foreground">Used for image and document analysis tasks</div>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                disabled={validateConnection.isPending || isLoading}
                className="flex items-center gap-2 bg-transparent"
                onClick={runConnectionValidation}
              >
                {validateConnection.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Validate connection
              </Button>
              {validationResult?.isValid && <div className="text-green-500 text-sm">Connection is valid</div>}
              {validationResult && !validationResult?.isValid && (
                <div className="text-red-500 text-sm">{validationResult.error}</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (model ? "Updating..." : "Adding...") : model ? "Update Model" : "Add Model"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
