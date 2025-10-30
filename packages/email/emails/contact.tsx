import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export function ContactEmail({ name, email, message }: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>New Contact Form Submission</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={paragraph}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={paragraph}>
              <strong>Message:</strong>
            </Text>
            <div style={messageContainer}>
              <Text style={messageText}>{message}</Text>
            </div>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>This message was sent via the PaperJet contact form.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const header = {
  padding: "20px 30px",
  borderBottom: "1px solid #e5e7eb",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1f2937",
  margin: "0",
};

const content = {
  padding: "30px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px 0",
};

const messageContainer = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "16px",
  margin: "16px 0",
};

const messageText = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  padding: "20px 30px",
  borderTop: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb",
  borderRadius: "0 0 8px 8px",
};

const footerText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
};
