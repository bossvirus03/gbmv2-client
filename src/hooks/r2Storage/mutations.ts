import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { getR2StorageStats, R2StorageStats } from "@/services/r2Service";

export const useRefreshR2StorageMutationBase = (
  options?: UseMutationOptions<R2StorageStats, Error, void>
) => {
  return useMutation({
    mutationFn: () => getR2StorageStats(true),
    ...options,
  });
};
