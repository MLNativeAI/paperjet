import { useEffect, useState } from "react";
import { Onboarding } from "@/components/onboarding";
import { useCompleteOnboarding, useOnboardingInfo } from "@/hooks/use-onboarding";

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [runTour, setRunTour] = useState(false);
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: onboardingInfo, isLoading: isOnboardingLoading } = useOnboardingInfo();

  useEffect(() => {
    if (!isOnboardingLoading && onboardingInfo) {
      const hasCompletedOnboarding = onboardingInfo.onboardingCompleted;
      if (!hasCompletedOnboarding) {
        setRunTour(true);
      }
    }
  }, [onboardingInfo, isOnboardingLoading]);

  const handleTourComplete = async () => {
    setRunTour(false);
    await completeOnboardingMutation.mutateAsync();
  };

  return (
    <>
      {children}
      <Onboarding run={runTour} onTourComplete={handleTourComplete} />
    </>
  );
}
