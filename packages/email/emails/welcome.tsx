import { Link, Section, Text } from "@react-email/components";
import { ActionButton, EmailHeading, EmailLayout, FooterSection, LogoSection } from "./shared-components";

export interface WelcomeEmailProps {
  email: string;
}

export const WelcomeEmail = ({ email }: WelcomeEmailProps) => {
  const previewText = "Welcome to PaperJet - Privacy-first document processing";

  return (
    <EmailLayout previewText={previewText}>
      <LogoSection />

      <EmailHeading>Welcome to PaperJet</EmailHeading>

      <Text className="text-black text-[14px] leading-[24px]">Hi there,</Text>

      <Text className="text-black text-[14px] leading-[24px]">
        Thank you for your interest in PaperJet! We're excited to have you on board.
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        PaperJet is a <strong>privacy-first document processing platform</strong> that helps you securely extract data
        from any document while keeping your data completely private and self-hostable.
      </Text>

      <Section className="bg-[#f6f9fc] rounded-lg p-[16px] my-[24px]">
        <Text className="text-[#374151] text-[14px] leading-[20px] m-0">
          <strong>What makes PaperJet special:</strong>
        </Text>
        <Text className="text-[#374151] text-[12px] leading-[18px] mt-[8px] mb-0">
          ✅ <strong>Open source</strong> - Full transparency and community-driven
          <br />✅ <strong>Privacy-first</strong> - Your data never leaves your control
          <br />✅ <strong>Self-hostable</strong> - Deploy on your own infrastructure
          <br />✅ <strong>Custom workflows</strong> - Build exactly what you need
        </Text>
      </Section>

      <Text className="text-black text-[14px] leading-[24px]">
        We'll notify you as soon as we launch. Get ready to revolutionize your document processing workflow!
      </Text>

      <ActionButton href="https://github.com/mlnativeai/paperjet">⭐ Star us on GitHub</ActionButton>

      <FooterSection>
        <Text className="text-[#666666] text-[12px] leading-[24px]">
          This email was sent to <span className="text-black">{email}</span> because you signed up for PaperJet launch
          notifications.
        </Text>

        <Text className="text-[#666666] text-[12px] leading-[24px]">
          If you have any questions, feel free to reach out to us at{" "}
          <Link href="mailto:hello@getpaperjet.com" className="text-blue-600 no-underline">
            hello@getpaperjet.com
          </Link>
        </Text>
      </FooterSection>
    </EmailLayout>
  );
};

WelcomeEmail.PreviewProps = {
  email: "jane.doe@example.com",
} as WelcomeEmailProps;

export default WelcomeEmail;
