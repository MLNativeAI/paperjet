import { getUsageData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useUsageData() {
  const {
    data: usageData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["usage-data"],
    queryFn: getUsageData,
  })

  return {
    usageData, isLoading, refetch
  }
}
