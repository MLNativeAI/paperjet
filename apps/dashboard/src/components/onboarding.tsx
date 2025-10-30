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
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Welcome to PaperJet! 🎉</h3>
          <p className="text-sm text-muted-foreground">
            You're all set up! Let's walk you through your workspace and show you how to create and manage your
            workflows.
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Quick introduction to the interface</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Learn about key features</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Tips to get you started quickly</span>
            </div>
          </div>
        </div>
      ),
      title: "Welcome to PaperJet!",
      placement: "center",
      disableBeacon: true,
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
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Welcome to PaperJet! 🎉</h3>
          <p className="text-sm text-muted-foreground">
            You're all set up as an admin! Let's walk you through your workspace and show you how to manage your team
            and workflows.
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Quick introduction to the interface</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Learn about key features</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Tips to get you started quickly</span>
            </div>
          </div>
        </div>
      ),
      title: "Welcome Admin!",
      placement: "center",
      disableBeacon: true,
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
