import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";

export type FormMode = "sign-in" | "sign-up" | "admin-sign-up";

const getSuccessMessage = (formMode: FormMode): string => {
  switch (formMode) {
    case "sign-in":
      return "Signed in successfully";
    case "admin-sign-up":
      return "Admin account created successfully";
    case "sign-up":
      return "Account created successfully";
  }
};

const getFailureMessage = (formMode: FormMode): string => {
  switch (formMode) {
    case "sign-in":
      return "Failed to sign in";
    case "admin-sign-up":
      return "Failed to create account";
    case "sign-up":
      return "Failed to create account";
  }
};

const getSubmitButtonText = (formMode: FormMode): string => {
  switch (formMode) {
    case "sign-in":
      return "Sign in";
    case "sign-up":
      return "Create account";
    case "admin-sign-up":
      return "Create admin account";
  }
};
export function EmailPasswordForm({
  formMode,
  setError,
  isLoading,
  setIsLoading,
  invitationId,
}: {
  formMode: FormMode;
  setError: (_: string) => void;
  isLoading: boolean;
  setIsLoading: (_: boolean) => void;
  invitationId?: string;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const emailPasswordSchema = z.object({
    email: z.string().min(2).max(50),
    password: z.string(),
  });
  const form = useForm<z.infer<typeof emailPasswordSchema>>({
    resolver: zodResolver(emailPasswordSchema),
  });

  const callAuthFunction = async (values: z.infer<typeof emailPasswordSchema>) => {
    if (formMode === "sign-in") {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/api/internal/auth-callback?signedIn=true",
      });
      return { data, error };
    } else {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.email,
        callbackURL: "/api/internal/auth-callback?newUser=true",
      });
      return { data, error };
    }
  };

  const onSubmit = async (values: z.infer<typeof emailPasswordSchema>) => {
    setIsLoading(true);
    const { data, error } = await callAuthFunction(values);
    setIsLoading(false);
    if (data) {
      toast.success(getSuccessMessage(formMode));
      await queryClient.resetQueries();
      if (invitationId) {
        navigate({ to: "/settings/organization" });
      } else {
        navigate({ to: "/" });
      }
    } else {
      console.error(error);
      // A rare case where a polar customer exists but not in our database - this will likely only trigger during testing
      if (error?.code?.startsWith("POLAR_CUSTOMER_CREATION_FAILED")) {
        const msg = "This account already exists. Please sign in.";
        setError(msg);
        toast.error(msg);
      } else {
        setError(error?.message || "");
        toast.error(getFailureMessage(formMode));
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getSubmitButtonText(formMode)}
        </Button>
      </form>
    </Form>
  );
}
