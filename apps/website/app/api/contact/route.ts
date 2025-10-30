import { ContactEmail, render } from "@paperjet/email";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();

    // Validate the request body
    const validatedData = contactSchema.parse(body);

    // Generate email HTML using the ContactEmail template
    const contactEmailHtml = await render(ContactEmail(validatedData));

    // Send email to support
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "PaperJet <noreply@getpaperjet.com>",
      to: [process.env.SUPPORT_EMAIL || "support@getpaperjet.com"],
      subject: `New Contact Form Submission from ${validatedData.name}`,
      html: contactEmailHtml,
      replyTo: validatedData.email,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ message: "Message sent successfully!", id: data?.id }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
