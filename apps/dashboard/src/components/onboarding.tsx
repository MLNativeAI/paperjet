"use client";

import Joyride, { type Step } from "react-joyride";

interface OnboardingProps {
  userRole?: string;
  run: boolean;
  onTourComplete: () => void;
}

export function Onboarding({ userRole, run, onTourComplete }: OnboardingProps) {
  const isAdmin = userRole === "superadmin" || userRole === "admin";

  const userSteps: Step[] = [
    {
      target: "body",
      content: "Welcome to PaperJet! Let's show you around your workspace.",
      title: "Welcome to PaperJet!",
      placement: "center",
    },
    {
      target: "[data-tour='workflows']",
      content:
        "This is where you can create and manage your workflows. Workflows help you process documents automatically.",
      title: "Workflows",
    },
    {
      target: "[data-tour='executions']",
      content: "View all your document processing executions and their results here.",
      title: "Executions",
    },
    {
      target: "[data-tour='settings']",
      content: "Manage your account, organization settings, and API keys here.",
      title: "Settings",
    },
  ];

  const adminSteps: Step[] = [
    {
      target: "body",
      content: "Welcome to PaperJet! As an admin, you have access to powerful management features.",
      title: "Welcome Admin!",
    },
    {
      target: "[data-tour='workflows']",
      content:
        "Manage workflows for your organization. You can create, edit, and configure document processing workflows.",
      title: "Workflow Management",
    },
    {
      target: "[data-tour='executions']",
      content: "Monitor all document processing executions across your organization.",
      title: "Execution Monitoring",
    },
    {
      target: "[data-tour='admin']",
      content: "Access admin-specific features including user management and system configuration.",
      title: "Admin Features",
    },
    {
      target: "[data-tour='settings']",
      content: "Manage organization settings, billing, and team members.",
      title: "Organization Settings",
    },
  ];

  const steps = isAdmin ? adminSteps : userSteps;

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={(data) => {
        if (data.status === "finished" || data.status === "skipped") {
          onTourComplete();
        }
      }}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          arrowColor: "#fff",
          backgroundColor: "#fff",
          primaryColor: "#007bff",
          textColor: "#333",
          zIndex: 1000,
        },
      }}
    />
  );
}
