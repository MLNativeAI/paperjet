import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const GoogleIcon = () => (
	<svg className="h-4 w-4" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
		/>
		<path
			fill="currentColor"
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
		/>
		<path
			fill="currentColor"
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
		/>
		<path
			fill="currentColor"
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
		/>
	</svg>
);

const MicrosoftIcon = () => (
	<svg className="h-4 w-4" viewBox="0 0 24 24">
		<path fill="#f25022" d="M1 1h10v10H1z" />
		<path fill="#00a4ef" d="M13 1h10v10H13z" />
		<path fill="#7fba00" d="M1 13h10v10H1z" />
		<path fill="#ffb900" d="M13 13h10v10H13z" />
	</svg>
);

export function SignUpForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [authMethod, setAuthMethod] = useState<"social" | "magiclink">(
		"social",
	);
	const [magicLinkSent, setMagicLinkSent] = useState(false);
	const navigate = useNavigate();

	const handleSocialSignUp = async (provider: "google" | "microsoft") => {
		setError("");
		setIsLoading(true);

		try {
			await authClient.signUp.social({
				provider,
			});
			// Don't set loading to false here - let the redirect complete
			// The loading state will be reset when the component unmounts or page reloads
		} catch (err) {
			setError("An error occurred during sign up");
			setIsLoading(false);
		}
	};

	const handleMagicLinkSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;

		try {
			const { error } = await authClient.signIn.magicLink({
				email,
				callbackURL: "/",
			});

			if (error) {
				setError(error.message || "An error occurred sending the magic link");
				return;
			}

			setMagicLinkSent(true);
			toast.success(
				"Magic link sent! Check your email to complete registration.",
			);
		} catch (err) {
			setError("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader>
					<CardTitle>Create an account</CardTitle>
					<CardDescription>
						Choose your preferred sign-up method
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4">
						{authMethod === "social" && (
							<>
								<div className="flex flex-col gap-3">
									<Button
										type="button"
										variant="outline"
										className="w-full"
										disabled={isLoading}
										onClick={() => handleSocialSignUp("google")}
									>
										{isLoading ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<GoogleIcon />
										)}
										<span className="ml-2">Continue with Google</span>
									</Button>
									<Button
										type="button"
										variant="outline"
										className="w-full"
										disabled={isLoading}
										onClick={() => handleSocialSignUp("microsoft")}
									>
										{isLoading ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<MicrosoftIcon />
										)}
										<span className="ml-2">Continue with Microsoft</span>
									</Button>
								</div>

								<div className="relative">
									<div className="absolute inset-0 flex items-center">
										<span className="w-full border-t" />
									</div>
									<div className="relative flex justify-center text-xs uppercase">
										<span className="bg-background px-2 text-muted-foreground">
											Or
										</span>
									</div>
								</div>

								<Button
									type="button"
									variant="ghost"
									className="w-full"
									onClick={() => setAuthMethod("magiclink")}
								>
									Sign up with magic link
								</Button>
							</>
						)}

						{authMethod === "magiclink" && (
							<div className="flex flex-col gap-3">
								{!magicLinkSent ? (
									<form onSubmit={handleMagicLinkSignUp}>
										<div className="flex flex-col gap-3">
											<div className="grid gap-2">
												<Label htmlFor="email">Email</Label>
												<Input
													id="email"
													name="email"
													type="email"
													placeholder="m@example.com"
													required
													disabled={isLoading}
												/>
											</div>
											<Button
												type="submit"
												className="w-full"
												disabled={isLoading}
											>
												{isLoading && (
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												)}
												Send magic link
											</Button>
											<Button
												type="button"
												variant="ghost"
												className="w-full"
												onClick={() => {
													setAuthMethod("social");
													setError("");
												}}
											>
												Back to other options
											</Button>
										</div>
									</form>
								) : (
									<div className="text-center space-y-3">
										<div className="text-sm text-muted-foreground">
											Magic link sent! Check your email and click the link to
											create your account.
										</div>
										<Button
											type="button"
											variant="outline"
											className="w-full"
											onClick={() => {
												setMagicLinkSent(false);
												setError("");
											}}
										>
											Send another link
										</Button>
										<Button
											type="button"
											variant="ghost"
											className="w-full"
											onClick={() => {
												setAuthMethod("social");
												setMagicLinkSent(false);
												setError("");
											}}
										>
											Back to other options
										</Button>
									</div>
								)}
							</div>
						)}

						{error && <div className="text-sm text-red-500">{error}</div>}
					</div>

					<div className="mt-6 text-center text-sm">
						Already have an account?{" "}
						<Link
							from="/auth/sign-up"
							to="/auth/sign-in"
							className="underline underline-offset-4"
						>
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
