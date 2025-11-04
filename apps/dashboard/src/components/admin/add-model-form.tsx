import { zodResolver } from "@hookform/resolvers/zod";
import type { DbModelConfiguration } from "@paperjet/db/types";
import { type ConnectionValidationResult, type ModelConfigParams, modelConfigSchema } from "@paperjet/engine/types";
import type { ModelProvider } from "@paperjet/shared/types";

import { BrainIcon, EyeIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModelConfiguration } from "@/hooks/use-model-configuration";

const modelProviders: ModelProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    icon: "anthropic.jpeg",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    icon: "azure.png",
  },
  {
    id: "google",
    name: "Google Gemini",
    icon: "google.jpeg",
  },
  {
    id: "groq",
    name: "Groq",
    icon: "groq.png",
  },
  {
    id: "lmstudio",
    name: "LM Studio",
    icon: "lmstudio.jpeg",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    icon: "mistral.jpeg",
  },
  {
    id: "ollama",
    name: "Ollama",
    icon: "ollama.png",
  },
  {
    id: "openai",
    name: "OpenAI",
    icon: "openai.webp",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: "openrouter.jpeg",
  },
  {
    id: "vllm",
    name: "vLLM",
    icon: "vllm.jpeg",
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    icon: "openai.webp",
  },
];

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
        provider: (model.provider as "google" | "openai" | "openrouter" | "mistral" | "custom") || "google",
        providerApiKey: model.providerApiKey || "",
        modelName: model.modelName || "",
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
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {modelProviders.map((provider) => (
                    <button
                      type="button"
                      key={provider.id}
                      className={`h-16 w-40 flex items-center justify-center cursor-pointer transition-colors hover:bg-accent gap-4 px-4 border ${field.value === provider.id ? "border-primary bg-accent" : ""}`}
                      onClick={() => field.onChange(provider.id)}
                    >
                      <img src={`/brand-icons/${provider.icon}`} className="h-4 w-4" alt={provider.id} />
                      <span className="text-sm font-medium">{provider.name}</span>
                    </button>
                  ))}
                </div>
              </FormControl>
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
                <Input placeholder="gemini-2.5-flash" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Select at least one model type (Core or Vision) for this model configuration.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="isCore"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <button
                      type="button"
                      className={`h-16 w-full flex items-center justify-start cursor-pointer transition-colors hover:bg-accent gap-4 px-4 border rounded-md ${
                        field.value ? "border-primary bg-accent" : ""
                      }`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <BrainIcon />
                      <div className="text-start">
                        <div className="text-sm font-medium">Core Model</div>
                        <div className="text-xs text-muted-foreground mt-1">General document processing</div>
                      </div>
                    </button>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isVision"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <button
                      type="button"
                      className={`h-16 w-full flex items-center justify-start cursor-pointer transition-colors hover:bg-accent gap-4 px-4 border rounded-md ${
                        field.value ? "border-primary bg-accent" : ""
                      }`}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <EyeIcon />
                      <div className="text-start">
                        <div className="text-sm font-medium">Vision Model</div>
                        <div className="text-xs text-muted-foreground mt-1">Image and document analysis</div>
                      </div>
                    </button>
                  </FormControl>
                  <FormMessage />
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
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
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
