import { render, WelcomeEmail } from "@paperjet/email";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Send welcome email to the user
    const welcomeEmailHtml = await render(WelcomeEmail({ email }));

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "PaperJet <noreply@getpaperjet.com>",
      to: [email],
      subject: "Welcome to PaperJet - We'll notify you when we launch!",
      html: welcomeEmailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    await resend.contacts.create({
      email: email,
      unsubscribed: false,
      audienceId: "fef47217-a371-447f-bf4a-ae9711618a7e",
    });

    return NextResponse.json({ message: "Successfully subscribed!", id: data?.id }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
