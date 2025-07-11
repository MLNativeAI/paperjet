import { useState, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { Loader2, Mail, Lock } from "lucide-react";
import { getAuthMode, type AuthMode } from "@/lib/auth-mode";

export function SetupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [method, setMethod] = useState<"password" | "magic-link">("password");
  const [authMode, setAuthMode] = useState<AuthMode>("classic");

  useEffect(() => {
    getAuthMode().then(mode => {
      setAuthMode(mode);
      // In SaaS mode, default to magic link
      if (mode === "saas") {
        setMethod("magic-link");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = method === "password" ? (formData.get("password") as string) : undefined;

    try {
      const response = await api.setup["create-admin"].$post({
        json: {
          email,
          name,
          password,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || "Failed to create admin account");
      }

      if ((data as any).magicLinkSent) {
        setSuccessMessage("Admin account created! Check your email for the magic link to sign in.");
      } else {
        // Password method - redirect to sign in
        router.navigate({ to: "/auth/sign-in" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Admin Account</CardTitle>
        <CardDescription>
          This will be the first administrator account for your PaperJet instance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authMode === "classic" ? (
          <Tabs value={method} onValueChange={(v) => setMethod(v as "password" | "magic-link")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">
                <Lock className="mr-2 h-4 w-4" />
                Password
              </TabsTrigger>
              <TabsTrigger value="magic-link">
                <Mail className="mr-2 h-4 w-4" />
                Magic Link
              </TabsTrigger>
            </TabsList>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <TabsContent value="password" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={8}
                  required={method === "password"}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>
            </TabsContent>

            <TabsContent value="magic-link">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  We'll send a magic link to your email address to complete the setup
                </AlertDescription>
              </Alert>
            </TabsContent>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || !!successMessage}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin Account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>
        </Tabs>
        ) : (
          // SaaS mode - only magic link
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                We'll send a magic link to your email address to complete the setup
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || !!successMessage}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin Account...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}