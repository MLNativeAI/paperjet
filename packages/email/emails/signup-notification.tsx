import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface SignupNotificationEmailProps {
  email: string;
  timestamp: string;
  userAgent?: string;
}

export const SignupNotificationEmail = ({ email, timestamp, userAgent = "Unknown" }: SignupNotificationEmailProps) => {
  const previewText = `New PaperJet signup from ${email}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl mb-4">
                  <span className="text-white text-2xl">🎉</span>
                </div>
              </div>
            </Section>

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              New PaperJet Launch Signup!
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Great news! Someone new has signed up for PaperJet launch notifications.
            </Text>

            <Section className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-[16px] my-[24px]">
              <Text className="text-[#1f2937] text-[14px] leading-[20px] m-0 mb-[12px]">
                <strong>Signup Details:</strong>
              </Text>

              <div className="space-y-2">
                <div className="flex">
                  <Text className="text-[#6b7280] text-[12px] leading-[18px] m-0 w-[80px] font-medium">Email:</Text>
                  <Text className="text-[#1f2937] text-[12px] leading-[18px] m-0 font-mono">{email}</Text>
                </div>

                <div className="flex">
                  <Text className="text-[#6b7280] text-[12px] leading-[18px] m-0 w-[80px] font-medium">Time:</Text>
                  <Text className="text-[#1f2937] text-[12px] leading-[18px] m-0">{timestamp}</Text>
                </div>

                <div className="flex">
                  <Text className="text-[#6b7280] text-[12px] leading-[18px] m-0 w-[80px] font-medium">Browser:</Text>
                  <Text className="text-[#1f2937] text-[12px] leading-[18px] m-0 font-mono text-[10px]">
                    {userAgent}
                  </Text>
                </div>
              </div>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              The user has been automatically sent a welcome email and added to the launch notifications list.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This notification was sent from the PaperJet website signup form. To manage notification settings, contact
              your development team.
            </Text>

            <Section className="text-center mt-[24px]">
              <Text className="text-[#999999] text-[10px] leading-[16px]">PaperJet Internal Notification System</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

SignupNotificationEmail.PreviewProps = {
  email: "jane.doe@example.com",
  timestamp: new Date().toLocaleString(),
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
} as SignupNotificationEmailProps;

export default SignupNotificationEmail;
