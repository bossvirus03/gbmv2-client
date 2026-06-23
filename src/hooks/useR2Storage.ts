import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getR2StorageStats, R2StorageStats } from "@/services/r2Service";

export const useR2StorageQuery = () => {
  return useQuery<R2StorageStats>({
    queryKey: ["r2-storage"],
    queryFn: () => getR2StorageStats(false),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });
};

export const useRefreshR2StorageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => getR2StorageStats(true),
    onSuccess: (data) => {
      // Update the cache immediately with the fresh data
      queryClient.setQueryData(["r2-storage"], data);
    },
  });
};
