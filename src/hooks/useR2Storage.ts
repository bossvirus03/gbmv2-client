import { useQueryClient } from "@tanstack/react-query";
import { useR2StorageQueryBase } from "./r2Storage/queries";
import { useRefreshR2StorageMutationBase } from "./r2Storage/mutations";
import { R2StorageStats } from "@/services/r2Service";

export const useR2StorageQuery = () => {
  return useR2StorageQueryBase();
};

export const useRefreshR2StorageMutation = () => {
  const queryClient = useQueryClient();
  return useRefreshR2StorageMutationBase({
    onSuccess: (data) => {
      // Update the cache immediately with the fresh data
      queryClient.setQueryData(["r2-storage"], data);
    },
  });
};
export type { R2StorageStats };


