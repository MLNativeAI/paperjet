"use client";

import { useEffect, useState } from "react";
import { Onboarding } from "@/components/onboarding";
import { WelcomeModal } from "@/components/welcome-modal";
import { useCompleteOnboarding, useOnboardingInfo } from "@/hooks/use-onboarding";
import { useAuthenticatedUser } from "@/hooks/use-user";

export function OnboardingProvider({ children }: { children: React.PropsWithChildren }) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { user } = useAuthenticatedUser();
  const [runTour, setRunTour] = useState(false);
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: onboardingInfo, isLoading: isOnboardingLoading } = useOnboardingInfo();

  useEffect(() => {
    if (!isOnboardingLoading && onboardingInfo) {
      const hasCompletedOnboarding = onboardingInfo.onboardingCompleted;
      if (!hasCompletedOnboarding && user) {
        setShowWelcomeModal(true);
      }
    }
  }, [onboardingInfo, isOnboardingLoading, user]);

  const handleStartTour = () => {
    setShowWelcomeModal(false);
    setRunTour(true);
  };

  const handleSkipOnboarding = () => {
    setShowWelcomeModal(false);
    // Mark as completed so it doesn't show again
    completeOnboardingMutation.mutate();
  };

  const handleTourComplete = async () => {
    setRunTour(false);
    await completeOnboardingMutation.mutateAsync();
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
      <Onboarding userRole={onboardingInfo?.role || undefined} run={runTour} onTourComplete={handleTourComplete} />
    </>
  );
}
