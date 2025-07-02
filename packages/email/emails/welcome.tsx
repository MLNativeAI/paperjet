import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Tailwind, Text } from "@react-email/components";
import * as React from "react";

export interface WelcomeEmailProps {
    email: string;
}

export const WelcomeEmail = ({ email }: WelcomeEmailProps) => {
    const previewText = `Welcome to PaperJet - Privacy-first document processing`;

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px]">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4">
                                    <span className="text-white text-xl font-bold">P</span>
                                </div>
                            </div>
                        </Section>

                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Welcome to <strong>PaperJet</strong>! 🚀
                        </Heading>

                        <Text className="text-black text-[14px] leading-[24px]">Hi there,</Text>

                        <Text className="text-black text-[14px] leading-[24px]">
                            Thank you for your interest in PaperJet! We're excited to have you on board.
                        </Text>

                        <Text className="text-black text-[14px] leading-[24px]">
                            PaperJet is a <strong>privacy-first document processing platform</strong> that helps you securely extract data from any document
                            while keeping your data completely private and self-hostable.
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

                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-[12px] font-semibold no-underline text-center px-6 py-3"
                                href="https://github.com/paperjet-ai/paperjet"
                            >
                                ⭐ Star us on GitHub
                            </Button>
                        </Section>

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            This email was sent to <span className="text-black">{email}</span> because you signed up for PaperJet launch notifications.
                        </Text>

                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            If you have any questions, feel free to reach out to us at{" "}
                            <Link href="mailto:hello@getpaperjet.com" className="text-blue-600 no-underline">
                                hello@getpaperjet.com
                            </Link>
                        </Text>

                        <Section className="text-center mt-[24px]">
                            <Text className="text-[#999999] text-[10px] leading-[16px]">PaperJet - Privacy-first document processing</Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

WelcomeEmail.PreviewProps = {
    email: "jane.doe@example.com",
} as WelcomeEmailProps;

export default WelcomeEmail;
