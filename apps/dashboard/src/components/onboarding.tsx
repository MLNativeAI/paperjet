"use client";

import { useRef } from "react";
import Joyride, { type Step } from "react-joyride";
import { toast } from "sonner";

interface OnboardingProps {
  userRole?: string;
  run: boolean;
  onTourComplete: () => void;
}

export function Onboarding({ run, onTourComplete }: OnboardingProps) {
  const hasHandledFinish = useRef(false);
  const userSteps: Step[] = [
    {
      target: "body",
      content: "Would you like an express tour of the app? It literally takes 1 minute.",
      title: "Welcome to PaperJet!",
      placement: "center",
      // disableBeacon: true,
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
    {
      target: "[data-tour='docs']",
      content: "If you need more information you can find them in the docs here",
      title: "That's it!",
    },
  ];

  return (
    <Joyride
      steps={userSteps}
      run={run}
      callback={(data) => {
        if ((data.status === "finished" || data.status === "skipped") && !hasHandledFinish.current) {
          hasHandledFinish.current = true;
          toast.success(
            data.status === "finished"
              ? "Onboarding completed! Happy converting!"
              : "Got it! We won't bother you again",
          );
          onTourComplete();
        }
      }}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          arrowColor: "var(--card-foreground)",
          backgroundColor: "var(--card)",
          primaryColor: "var(--primary)",
          textColor: "var(--card-foreground)",
          zIndex: 1000,
          overlayColor: "rgba(0, 0, 0, 0.5)",
          spotlightShadow: "var(--shadow-lg)",
        },
        tooltip: {
          backgroundColor: "var(--card)",
          // border: `1px solid var(--border)`,
          // borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          color: "var(--card-foreground)",
          fontFamily: "var(--font-sans)",
          // fontSize: "0.875rem",
          // lineHeight: 1.5,
          // padding: "calc(var(--spacing) * 1.5)",
          // maxWidth: "320px",
        },
        tooltipTitle: {
          color: "var(--card-foreground)",
          fontFamily: "var(--font-sans)",
          // fontSize: "1.125rem",
          fontWeight: 600,
          // marginBottom: "var(--spacing)",
        },
        tooltipContent: {
          color: "var(--muted-foreground)",
          fontFamily: "var(--font-sans)",
          // fontSize: "0.875rem",
          // lineHeight: 1.5,
          // padding: "calc(var(--spacing) / 2) 0",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        spotlight: {
          borderRadius: "var(--radius-xl)",
        },
        beacon: {
          display: "none",
        },
      }}
    />
  );
}
