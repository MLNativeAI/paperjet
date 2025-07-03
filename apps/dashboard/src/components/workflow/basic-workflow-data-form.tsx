"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ValidWorkflow } from "@paperjet/db/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateWorkflowBasicData } from "@/hooks/use-update-workflow-basic-data";

const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function BasicWorkflowDataForm({ workflow }: { workflow: ValidWorkflow }) {
    const { mutate: updateWorkflow, isPending } = useUpdateWorkflowBasicData();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: workflow?.name || "",
            description: workflow?.description || "",
        },
    });

    const onSubmit = (data: FormData) => {
        updateWorkflow({
            workflowId: workflow.id,
            name: data.name,
            description: data.description,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Workflow Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter workflow name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe what this workflow does"
                                    className="min-h-[100px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Workflow"}
                </Button>
            </form>
        </Form>
    );
}
