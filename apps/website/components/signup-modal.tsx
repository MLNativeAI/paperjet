"use client";

import { sendGTMEvent } from "@next/third-parties/google";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle, Loader2, Mail } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SignupModalProps {
  triggerText?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  triggerClassName?: string;
  showArrow?: boolean;
}

export function SignupModal({
  triggerText = "Get Early Access",
  triggerVariant = "default",
  triggerSize = "lg",
  triggerClassName = "",
  showArrow = true,
}: SignupModalProps = {}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const posthog = usePostHog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        posthog.capture("waitlist_sign_up");
        sendGTMEvent({
          event: "waitlist_signup",
          send_to: "AW-16468275958/pBuYCM-7s7MbEPbl16w9",
          value: 1.0,
          currency: "PLN",
        });
        const newSearchParams = new URLSearchParams(window.location.search);
        newSearchParams.set("subscribed", "true");
        router.push(`${pathname}?${newSearchParams.toString()}`);
        setStatus("success");
        setMessage("Thank you! We'll notify you when PaperJet launches.");
        setEmail("");
        setTimeout(() => {
          setOpen(false);
          setStatus("idle");
          setMessage("");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (_error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (open) {
        posthog.capture("get_started_click");
      }
      if (!newOpen) {
        setEmail("");
        setStatus("idle");
        setMessage("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className={`px-6 ${triggerClassName}`}>
          {triggerText}
          {showArrow && <ArrowRight className="ml-1 h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-primary" />
            Get Notified When We Launch
          </DialogTitle>
          <DialogDescription>
            Be the first to experience privacy-first document processing. We'll send you an email as soon as PaperJet is
            ready!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || status === "success"}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              required
            />

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                    status === "success"
                      ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                      : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  {status === "success" ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading || status === "success"} className="flex-1">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              {isLoading ? "Subscribing..." : "Notify Me"}
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center">
          <span className="block mt-2">
            By signing up, you consent to receive product updates and launch notifications from us.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
