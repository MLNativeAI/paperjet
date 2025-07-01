"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle, Loader2, Mail, X } from "lucide-react";
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
        } catch (error) {
            setStatus("error");
            setMessage("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!isLoading) {
            setOpen(newOpen);
            if (!newOpen) {
                setEmail("");
                setStatus("idle");
                setMessage("");
            }
        }
    };

        <div className="text-xs text-muted-foreground text-center">
          <span className="block mt-2">
            By signing up, you consent to receive product updates and launch notifications from us.
          </span>
        </div>
      </DialogContent>
    </Dialog>
    );
}
