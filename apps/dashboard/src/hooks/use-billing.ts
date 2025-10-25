import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useBilling() {
  const {
    data: customerState,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["billing"],
    staleTime: 30 * 1000,
    queryFn: async () => {
      const response = await authClient.customer.state();
      return response.data;
    },
  });

  // TODO: Figure out how to fetch product names effectively
  // const {
  //   status,
  //   fetchStatus,
  //   data: projects,
  // } = useQuery({
  //   queryKey: ["subscription-info", customerState],
  //   queryFn: getProjectsByUser,
  //   // The query will not execute until the userId exists
  //   enabled: !!customerState,
  // });
  return { customerState, isLoading, refetch };
}
