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

export function EmailPasswordForm({
  setError, isLoading, setIsLoading
}: {
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

  const onSubmit = async (values: z.infer<typeof emailPasswordSchema>) => {
    setIsLoading(true)
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    })
    setIsLoading(false)
    if (data) {
      toast.success("Signed in successfully")
      await navigate({ to: "/" })
    } else {
      setError(error.message || '')
      toast.error("Sign in failed")
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

