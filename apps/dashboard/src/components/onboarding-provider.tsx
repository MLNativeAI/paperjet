"use client";

import { User } from "better-auth";
import { useEffect, useState } from "react";
import { Onboarding } from "@/components/onboarding";
import { WelcomeModal } from "@/components/welcome-modal";
import { useAuthenticatedUser } from "@/hooks/use-user";

export function OnboardingProvider({ children }: { children: React.PropsWithChildren }) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { user } = useAuthenticatedUser();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = user?.onboardingCompleted;

    if (!hasCompletedOnboarding && user) {
      setShowWelcomeModal(true);
    }
  }, [user?.onboardingCompleted]);

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    setRunTour(true);
  };

  const handleSkipOnboarding = () => {
    setShowWelcomeModal(false);
    // Mark as completed so it doesn't show again
    completeOnboarding();
  };

  const handleTourComplete = async () => {
    setRunTour(false);
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      // Call our custom onboarding completion endpoint
      const response = await fetch("/api/auth/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  return (
    <>
      {children}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleSkipOnboarding}
        onStartTour={handleStartTour}
        user={user}
      />
      <Onboarding userRole={user?.role} run={runTour} onTourComplete={handleTourComplete} />
    </>
  );
}
