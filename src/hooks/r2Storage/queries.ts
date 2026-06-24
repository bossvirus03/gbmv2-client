import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getR2StorageStats, R2StorageStats } from "@/services/r2Service";

export const useR2StorageQueryBase = (options?: Omit<UseQueryOptions<R2StorageStats, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<R2StorageStats>({
    queryKey: ["r2-storage"],
    queryFn: () => getR2StorageStats(false),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    ...options,
  });
};
