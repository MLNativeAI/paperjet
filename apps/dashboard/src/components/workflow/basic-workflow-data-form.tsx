"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ValidWorkflow } from "@paperjet/db/types";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export interface BasicWorkflowDataFormRef {
    submit: () => Promise<FormData | undefined>;
    getValues: () => FormData;
}

const BasicWorkflowDataForm = forwardRef<BasicWorkflowDataFormRef, { workflow: ValidWorkflow }>(({ workflow }, ref) => {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: workflow?.name || "",
            description: workflow?.description || "",
        },
    });

    useImperativeHandle(ref, () => ({
        submit: async () => {
            const isValid = await form.trigger();
            if (isValid) {
                return form.getValues();
            }
            return undefined;
        },
        getValues: () => form.getValues(),
    }));

    return (
        <Form {...form}>
            <div className="space-y-6">
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
                                <Textarea placeholder="Describe what this workflow does" className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </Form>
    );
});

BasicWorkflowDataForm.displayName = "BasicWorkflowDataForm";

export default BasicWorkflowDataForm;
