
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

export function AdminSetupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const navigate = useNavigate()
  const adminFormSchema = z.object({
    email: z.string().min(2).max(50),
    password: z.string().min(8)
  })
  const form = useForm<z.infer<typeof adminFormSchema>>({ resolver: zodResolver(adminFormSchema) });

  const onSubmit = async (values: z.infer<typeof adminFormSchema>) => {
    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.email,
    })
    if (data) {
      toast.success("Admin account created successfully")
      await navigate({ to: "/" })
    } else {
      toast.error("Admin setup failed")
      console.error(error)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome to PaperJet!</CardTitle>
          <CardDescription>
            Let's start by creating an admin account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <div className="grid gap-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Admin email
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Admin password
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                Create admin account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div >
  )
}
