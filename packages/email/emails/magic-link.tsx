import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export interface MagicLinkEmailProps {
  email: string;
  url: string;
  token?: string;
}

export const MagicLinkEmail = ({ email, url, token }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sign in to PaperJet</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Sign in to PaperJet</Heading>
          <Text style={text}>
            Click the button below to sign in to your PaperJet account. This
            link will expire in 10 minutes.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Sign in to PaperJet
            </Button>
          </Section>
          <Text style={text}>
            If you didn't request this email, you can safely ignore it.
          </Text>
          <Text style={footer}>
            If the button doesn't work, copy and paste this link into your
            browser:
            <br />
            {url}
          </Text>
          {token && (
            <Text style={footer}>
              <br />
              Alternatively, you can use this one-time code:{" "}
              <strong>{token}</strong>
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 20px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "32px 0 0 0",
};
