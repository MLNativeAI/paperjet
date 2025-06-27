import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/verify-magic-link")({
    validateSearch: (search: Record<string, unknown>) => ({
        token: search.token as string,
    }),
    component: VerifyMagicLinkPage,
});

function VerifyMagicLinkPage() {
    const { token } = Route.useSearch();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setError("Invalid magic link - missing token");
            return;
        }

        const verifyToken = async () => {
            try {
                const { data, error } = await authClient.magicLink.verify({
                    query: { token },
                });

                if (error) {
                    setStatus("error");
                    setError(error.message || "Failed to verify magic link");
                    return;
                }

                setStatus("success");
                toast.success("Successfully signed in!");

                // Redirect to home page after a short delay
                setTimeout(() => {
                    navigate({ to: "/" });
                }, 1000);
            } catch (err) {
                setStatus("error");
                setError("An unexpected error occurred");
            }
        };

        verifyToken();
    }, [token, navigate]);

    return (
        <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>
                        {status === "verifying" && "Verifying Magic Link"}
                        {status === "success" && "Welcome Back!"}
                        {status === "error" && "Verification Failed"}
                    </CardTitle>
                    <CardDescription>
                        {status === "verifying" && "Please wait while we verify your magic link..."}
                        {status === "success" && "You have been successfully signed in. Redirecting..."}
                        {status === "error" && "There was a problem verifying your magic link"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    {status === "verifying" && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
                    {status === "success" && <div className="text-green-600">✓ Successfully signed in</div>}
                    {status === "error" && <div className="text-red-600 text-sm">{error}</div>}
                </CardContent>
            </Card>
        </div>
    );
}
