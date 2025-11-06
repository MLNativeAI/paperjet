import { Text } from "@react-email/components";
import { ActionButton, EmailHeading, EmailLayout, FooterSection, LogoSection } from "./shared-components";

export const WelcomeEmail = () => {
  const previewText = "Welcome to PaperJet - Privacy-first document processing";

  return (
    <EmailLayout previewText={previewText}>
      <LogoSection />

      <EmailHeading>Welcome to PaperJet!</EmailHeading>

      <Text className="text-black text-[14px] leading-[24px]">Hi there!</Text>

      <Text className="text-black text-[14px] leading-[24px]">
        I'm Łukasz from PaperJet, and I want to personally thank you for joining us. We're excited to help you securely
        extract data from your documents.
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        PaperJet is built by a small team who deeply care about helping you run your document processing reliably and
        securely.
      </Text>

      <ActionButton href="https://app.getpaperjet.com">Go to your Dashboard</ActionButton>

      <Text className="text-[#666666] text-[12px] leading-[24px]">
        P.S. Need any help getting started? Just reply to this email - I personally read every message and I'm happy to
        help!
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        Best regards, <br />
        Łukasz
      </Text>

      <FooterSection />
    </EmailLayout>
  );
};

export default WelcomeEmail;
