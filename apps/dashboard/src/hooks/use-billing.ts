import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export function useBilling() {
  const {
    data: customerState,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      const response = await authClient.customer.state();
      return response.data;
    },
  });
  return { customerState, isLoading, refetch };
}
