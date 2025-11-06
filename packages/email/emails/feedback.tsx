import { Text } from "@react-email/components";
import { ActionButton, EmailHeading, EmailLayout, FooterSection, LogoSection } from "./shared-components";

export const FeedbackEmail = () => {
  const previewText = "How's your PaperJet journey so far?";

  return (
    <EmailLayout previewText={previewText}>
      <LogoSection />

      <EmailHeading>PaperJet</EmailHeading>

      <Text className="text-black text-[14px] leading-[24px]">Hey there!</Text>

      <Text className="text-black text-[14px] leading-[24px]">
        How's PaperJet treating you so far? I hope you've had a chance to explore and run some document workflows.
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">I'd love to know:</Text>
      <Text className="ml-4 leading-[8px]">- What's working well for you?</Text>
      <Text className="ml-4 leading-[8px]">- Is anything confusing or unclear?</Text>
      <Text className="ml-4 leading-[8px]">- What features are you wishing for?</Text>

      <Text className="text-black text-[14px] leading-[24px]">
        You can check out our public board to leave your feedback, vote for features and share your thoughts:
      </Text>

      <ActionButton href="https://paperjet.userjot.com/">Visit our feedback board</ActionButton>

      <Text className="text-black text-[14px] leading-[24px]">
        Best regards, <br />
        Łukasz
      </Text>

      <FooterSection />
    </EmailLayout>
  );
};

export default FeedbackEmail;
