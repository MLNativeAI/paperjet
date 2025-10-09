import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText: string;
}

export const EmailLayout = ({ children, previewText }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans px-2">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
          {children}
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export const LogoSection = () => (
  <Section className="mt-[32px]">
    <Img
      width={100}
      height="auto"
      src={"https://getpaperjet.com/android-chrome-192x192.png"}
      alt="PaperJet logo"
      className="my-0 mx-auto"
    />
  </Section>
);

interface EmailHeadingProps {
  children: React.ReactNode;
}

export const EmailHeading = ({ children }: EmailHeadingProps) => (
  <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">{children}</Heading>
);

interface ActionButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const ActionButton = ({
  href,
  children,
  className = "bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3",
}: ActionButtonProps) => (
  <Section className="text-center mt-[32px] mb-[32px]">
    <Button className={className} href={href}>
      {children}
    </Button>
  </Section>
);

interface FooterSectionProps {
  children: React.ReactNode;
}

export const FooterSection = ({ children }: FooterSectionProps) => (
  <>
    <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
    {children}
    <Section className="text-center mt-[24px]">
      <Text className="text-[#999999] text-[10px] leading-[16px]">PaperJet - Privacy-first document processing</Text>
    </Section>
  </>
);
