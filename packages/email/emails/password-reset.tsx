import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface ResetPasswordEmailTemplateProps {
  resetUrl: string;
  username: string;
}

export const ResetPasswordEmailTemplate = ({ username, resetUrl }: ResetPasswordEmailTemplateProps) => {
  const previewText = "Reset your password on CVtoBlind";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img src="https://app.cvtoblind.com/logo_cv2b.png" alt="CVToBlind logo" className="my-0 mx-auto" />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Reset your password on <strong>CVtoBlind</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">Hello {username},</Text>
            <Text className="text-black text-[14px] leading-[24px]">
              We received a request to reset your password. Click the button below to create a new password:
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={resetUrl}
              >
                Reset Password
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={resetUrl} className="text-blue-600 no-underline">
                {resetUrl}
              </Link>
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              This password reset link will expire in 1 hour for security reasons.
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This password reset request was intended for <span className="text-black">{username}</span>. If you did
              not request this password reset, you can ignore this email. If you are concerned about your account's
              safety, please reach out to{" "}
              <Link href="mailto:support@cvtoblind.com" className="text-blue-600 no-underline">
                support@cvtoblind.com
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmailTemplate;
