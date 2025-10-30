"use client";

import { useEffect, useState } from "react";
import { Onboarding } from "@/components/onboarding";
import { useCompleteOnboarding, useOnboardingInfo } from "@/hooks/use-onboarding";
import { useAuthenticatedUser } from "@/hooks/use-user";

export function OnboardingProvider({ children }: { children: React.PropsWithChildren }) {
  const { user } = useAuthenticatedUser();
  const [runTour, setRunTour] = useState(false);
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: onboardingInfo, isLoading: isOnboardingLoading } = useOnboardingInfo();

  useEffect(() => {
    if (!isOnboardingLoading && onboardingInfo) {
      const hasCompletedOnboarding = onboardingInfo.onboardingCompleted;
      if (!hasCompletedOnboarding && user) {
        // Start tour directly when onboarding is not completed
        setRunTour(true);
      }
    }
  }, [onboardingInfo, isOnboardingLoading, user]);

  const handleTourComplete = async () => {
    setRunTour(false);
    await completeOnboardingMutation.mutateAsync();
  };

  return (
    <>
      {children}
      <Onboarding userRole={onboardingInfo?.role || undefined} run={runTour} onTourComplete={handleTourComplete} />
    </>
  );
}
