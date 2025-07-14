import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "../ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "../ui/form";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";

export type FormMode = 'sign-in' | 'sign-up' | 'admin-sign-up'


const getSuccessMessage = (formMode: FormMode): string => {
  switch (formMode) {
    case 'sign-in': return 'Signed in successfully'
    case 'admin-sign-up': return 'Admin account created successfully'
    case 'sign-up': return 'Account created successfully'
  }
}

const getFailureMessage = (formMode: FormMode): string => {
  switch (formMode) {
    case 'sign-in': return 'Failed to sign in'
    case 'admin-sign-up': return 'Failed to create account'
    case 'sign-up': return 'Failed to create account'
  }
}

export function EmailPasswordForm({
  formMode,
  setError, isLoading, setIsLoading
}: {
  formMode: FormMode,
  setError: (_: string) => void,
  isLoading: boolean,
  setIsLoading: (_: boolean) => void
}) {

  const navigate = useNavigate()
  const emailPasswordSchema = z.object({
    email: z.string().min(2).max(50),
    password: z.string()
  })
  const form = useForm<z.infer<typeof emailPasswordSchema>>({ resolver: zodResolver(emailPasswordSchema) });

  const callAuthFunction = async (values: z.infer<typeof emailPasswordSchema>) => {
    if (formMode == 'sign-in') {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })
      return { data, error }
    } else {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.email,
      })
      return { data, error }
    }
  }

  const onSubmit = async (values: z.infer<typeof emailPasswordSchema>) => {
    setIsLoading(true)
    const { data, error } = await callAuthFunction(values)
    setIsLoading(false)
    if (data) {
      toast.success(getSuccessMessage(formMode))
      await navigate({ to: "/" })
    } else {
      setError(error?.message || '')
      toast.error(getFailureMessage(formMode))
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-3">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
            </FormItem>
          )} />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign in
        </Button>
      </form>
    </Form>
  )
}

