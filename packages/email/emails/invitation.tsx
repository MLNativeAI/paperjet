import { Section, Text } from "@react-email/components";
import { ActionButton, EmailHeading, EmailLayout, FooterSection, LogoSection } from "./shared-components";

export interface InvitationEmailProps {
  url: string;
  inviter: string;
  organizationName: string;
  role: string;
}

export const InvitationEmail = ({ url, inviter, organizationName, role }: InvitationEmailProps) => {
  const previewText = `You've been invited to join ${organizationName} on PaperJet`;

  return (
    <EmailLayout previewText={previewText}>
      <LogoSection />

      <EmailHeading>
        You're invited to <strong>PaperJet</strong>! 🎉
      </EmailHeading>

      <Text className="text-black text-[14px] leading-[24px]">Hi there,</Text>

      <Text className="text-black text-[14px] leading-[24px]">
        <strong>{inviter}</strong> has invited you to join <strong>{organizationName}</strong> on PaperJet as a{" "}
        <strong>{role}</strong>.
      </Text>

      <Section className="bg-[#f6f9fc] rounded-lg p-[16px] my-[24px]">
        <Text className="text-[#374151] text-[14px] leading-[20px] m-0">
          <strong>What you can do with PaperJet:</strong>
        </Text>
        <Text className="text-[#374151] text-[12px] leading-[18px] mt-[8px] mb-0">
          📄 <strong>Process any document</strong> - PDFs, images, scanned documents
          <br />🤖 <strong>AI-powered extraction</strong> - Extract data automatically
          <br />🔒 <strong>Privacy-first</strong> - Your data stays secure and private
          <br />⚡ <strong>Custom workflows</strong> - Build workflows for your specific needs
        </Text>
      </Section>

      <Text className="text-black text-[14px] leading-[24px]">
        Click the button below to accept the invitation and get started. This link will expire in 7 days.
      </Text>

      <ActionButton href={url}>Accept Invitation</ActionButton>

      <Text className="text-black text-[14px] leading-[24px]">
        If you didn't expect this invitation, you can safely ignore this email.
      </Text>

      <FooterSection>
        <Text className="text-[#666666] text-[12px] leading-[24px]">
          If the button doesn't work, copy and paste this link into your browser:
        </Text>
        <Text className="text-[#666666] text-[12px] leading-[24px] break-all">{url}</Text>
      </FooterSection>
    </EmailLayout>
  );
};

InvitationEmail.PreviewProps = {
  url: "https://paperjet.ai/invite/abc123",
  inviter: "John Doe",
  organizationName: "Acme Corp",
  role: "admin",
} as InvitationEmailProps;

export default InvitationEmail;
