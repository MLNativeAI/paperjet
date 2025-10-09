import { Text } from "@react-email/components";
import { ActionButton, EmailHeading, EmailLayout, FooterSection, LogoSection } from "./shared-components";

export interface ResetPasswordEmailTemplateProps {
  resetUrl: string;
  username: string;
}

export const ResetPasswordEmailTemplate = ({ username, resetUrl }: ResetPasswordEmailTemplateProps) => {
  const previewText = "Reset your password on PaperJet";

  return (
    <EmailLayout previewText={previewText}>
      <LogoSection />

      <EmailHeading>
        Reset your password on <strong>PaperJet</strong>
      </EmailHeading>

      <Text className="text-black text-[14px] leading-[24px]">Hi {username},</Text>

      <Text className="text-black text-[14px] leading-[24px]">
        We received a request to reset your PaperJet password. Click the button below to create a new password. This
        link will expire in 1 hour for security.
      </Text>

      <ActionButton href={resetUrl}>Reset Password</ActionButton>

      <Text className="text-black text-[14px] leading-[24px]">
        If you didn&apos;t request a password reset, you can ignore this message. Your account will remain secure.
      </Text>

      <FooterSection>
        <Text className="text-[#666666] text-[12px] leading-[24px]">
          If the button doesn&apos;t work, copy and paste this link into your browser:
        </Text>
        <Text className="text-[#666666] text-[12px] leading-[24px] break-all">{resetUrl}</Text>
        <Text className="text-[#666666] text-[12px] leading-[24px]">
          Need help? Reach out to <span className="text-black">support@getpaperjet.com</span> and we&apos;ll assist you
          right away.
        </Text>
      </FooterSection>
    </EmailLayout>
  );
};

ResetPasswordEmailTemplate.PreviewProps = {
  resetUrl: "https://paperjet.ai/reset/abc123",
  username: "Jane Doe",
} as ResetPasswordEmailTemplateProps;

export default ResetPasswordEmailTemplate;
