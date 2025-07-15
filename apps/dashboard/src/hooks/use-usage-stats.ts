
import { getUsageStats } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useUsageStats() {
  const {
    data: usageStats = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["usage-stats"],
    queryFn: getUsageStats,
  })

  return {
    usageStats, isLoading, refetch
  }
}
