import { useQueryClient } from "@tanstack/react-query";
import { useCapitalsQueryBase } from "./capitals/queries";
import {
  useCreateCapitalMutationBase,
  useUpdateCapitalMutationBase,
  useDeleteCapitalMutationBase,
} from "./capitals/mutations";
import { Capital } from "@/services/capitalService";

export const useCapitalsQuery = () => {
  return useCapitalsQueryBase();
};

export const useCreateCapitalMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useCreateCapitalMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitals"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateCapitalMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useUpdateCapitalMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitals"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteCapitalMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useDeleteCapitalMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capitals"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
export type { Capital };


