"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        reset();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to send message. Please try again.");
      }
    } catch (_error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="text-green-600 dark:text-green-400 text-6xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">Message Sent Successfully!</h3>
        <p className="text-green-700 dark:text-green-300">
          Thank you for reaching out. We'll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={cn(
            "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary",
            "bg-background border-input",
            errors.name && "border-destructive focus:ring-destructive",
          )}
          placeholder="Your name"
        />
        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={cn(
            "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary",
            "bg-background border-input",
            errors.email && "border-destructive focus:ring-destructive",
          )}
          placeholder="your@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          className={cn(
            "w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary",
            "bg-background border-input resize-vertical",
            errors.message && "border-destructive focus:ring-destructive",
          )}
          placeholder="Tell us how we can help you..."
        />
        {errors.message && <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
