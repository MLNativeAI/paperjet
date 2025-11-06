import {
  FeedbackEmail,
  InvitationEmail,
  MagicLinkEmail,
  NewSubscriptionEmail,
  ResetPasswordEmailTemplate,
  render,
  WelcomeEmail,
} from "@paperjet/email";
import { emailQueue } from "@paperjet/queue";
import { envVars, logger } from "@paperjet/shared";
import type { User } from "better-auth";
import type { Member, Organization } from "better-auth/plugins";
import { addDays } from "date-fns";
import { Resend } from "resend";

const resend = envVars.RESEND_API_KEY ? new Resend(envVars.RESEND_API_KEY) : null;

async function sendEmailHandler({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!resend) {
    logger.info(`Resend is disabled, not sending email to ${Array.isArray(to) ? to[0] : to}`);
    return;
  }

  try {
    await resend.emails.send({
      from: envVars.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "Łukasz from PaperJet <lukasz@getpaperjet.com>",
      to,
      subject,
      reply_to: replyTo,
      html,
    });
  } catch (error) {
    logger.error(error, "Failed to send email");
    throw error;
  }
}

function getApiBaseUrl() {
  if (envVars.ENVIRONMENT === "dev") {
    return "http://localhost:3000";
  } else {
    return envVars.BASE_URL;
  }
}

export async function scheduleFeedbackEmail(email: string) {
  if (!resend) {
    logger.info(`Resend is disabled, not sending feedback email`);
    return;
  }
  const targetTime = addDays(new Date(), 7);
  logger.info(`Scheduling feedback email for ${targetTime.toLocaleString()}`);
  const delay = Number(targetTime) - Number(Date.now());

  await emailQueue.add("feedback-email", { email: email, emailType: "feedback" }, { delay });
}

export async function sendNewSubscriptionEmail(email: string, planName: string) {
  const emailHtml = await render(NewSubscriptionEmail({ planName }));
  await sendEmailHandler({
    to: [email],
    subject: `You are now on the ${planName} plan`,
    html: emailHtml,
    replyTo: "lukasz@getpaperjet.com",
  });
}

export async function sendFeedbackEmail(email: string) {
  const emailHtml = await render(FeedbackEmail());
  await sendEmailHandler({
    to: [email],
    subject: "How's your PaperJet experience so far?",
    html: emailHtml,
    replyTo: "lukasz@getpaperjet.com",
  });
}

export async function sendWelcomeEmail(email: string) {
  const emailHtml = await render(WelcomeEmail());

  await sendEmailHandler({
    to: [email],
    subject: "Welcome to PaperJet!",
    html: emailHtml,
    replyTo: "lukasz@getpaperjet.com",
  });
}

export async function sendMagicLink({ email, url }: { email: string; url: string }) {
  if (!resend) {
    logger.info(`Magic link for ${email}: ${url}`);
    return;
  }

  logger.info({ email, url }, `Sending magic link to ${email}: ${url}`);
  const emailHtml = await render(MagicLinkEmail({ url }));

  await sendEmailHandler({
    to: email,
    subject: "Sign in to PaperJet",
    html: emailHtml,
  });
}

export async function sendInvitationEmail({
  email,
  role,
  organization,
  id,
  inviter,
}: {
  id: string;
  role: string;
  email: string;
  organization: Organization;
  inviter: Member & {
    user: User;
  };
}): Promise<void> {
  if (!resend) {
    logger.info(`Invitation link for ${email}: ${envVars.BASE_URL}/accept-invitation/${id}`);
    return;
  }

  const url = `${getApiBaseUrl()}/api/internal/accept-invitation?invitationId=${id}`;
  logger.info({ email, url }, `Sending invitation link to ${email}: ${url}`);
  const emailHtml = await render(
    InvitationEmail({
      url,
      inviter: inviter.user.name || inviter.user.email,
      organizationName: organization.name,
      role,
    }),
  );

  await sendEmailHandler({
    to: email,
    subject: `You've been invited to join ${organization.name} on PaperJet`,
    html: emailHtml,
  });
}

export async function sendPasswordResetEmail({ user, url }: { user: User; url: string }) {
  if (!resend) {
    logger.info(`Reset password link for ${user.email}: ${url}`);
    return;
  }

  logger.info(`Sending password reset link to ${user.email}: ${url}`);
  const emailHtml = await render(ResetPasswordEmailTemplate({ resetUrl: url, username: user.name }));

  await sendEmailHandler({
    to: user.email,
    subject: "Password reset",
    html: emailHtml,
  });
}
