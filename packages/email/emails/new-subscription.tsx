import { Link, Text } from "@react-email/components";
import { EmailHeading, EmailLayout, FooterSection, LogoSection } from "./shared-components";

type NewSubscriptionEmailProps = {
  planName: string;
};

export const NewSubscriptionEmail = ({ planName }: NewSubscriptionEmailProps) => {
  const previewText = `You are now subscribed to the ${planName} plan`;

  return (
    <EmailLayout previewText={previewText}>
      <LogoSection />

      <EmailHeading>PaperJet</EmailHeading>

      <Text className="text-black text-[14px] leading-[24px]">Hey there!</Text>

      <Text className="text-black text-[14px] leading-[24px]">
        Thanks for subscribing - we promise to do our best to meet your expectations. You are now on the{" "}
        <b>{planName}</b> plan, which comes with the following features:
      </Text>

      {planName === "Basic" &&
        ["- 100 document conversions", "- Max. 20 pages per document", "- Export as CSV & JSON", "- API Support"].map(
          (feature) => (
            <Text key={feature.substring(0, 5)} className="ml-4 leading-[8px]">
              {feature}
            </Text>
          ),
        )}

      {planName === "Pro" &&
        [
          "- 500 document conversions",
          "- Unlimited team members",
          "- Unlimited pages per document",
          "- Export as CSV & JSON",
          "- API Support",
        ].map((feature) => (
          <Text key={feature.substring(0, 5)} className="ml-4 leading-[8px]">
            {feature}
          </Text>
        ))}

      <Text className="text-black text-[14px] leading-[24px]">
        You can manage your subscription from the{" "}
        <Link href="https://app.getpaperjet.com/settings/billing">customer portal</Link>.
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        If you need help with anything, you can always reach out to me personally at lukasz@getpaperjet.com
      </Text>

      <Text className="text-black text-[14px] leading-[24px]">
        Best regards, <br />
        Łukasz
      </Text>

      <FooterSection />
    </EmailLayout>
  );
};

NewSubscriptionEmail.PreviewProps = {
  planName: "pro",
} as NewSubscriptionEmailProps;

export default NewSubscriptionEmail;
