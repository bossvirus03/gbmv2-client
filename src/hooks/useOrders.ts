import { useQueryClient } from "@tanstack/react-query";
import { useCreateOrderMutationBase } from "./orders/mutations";

export const useCreateOrderMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useCreateOrderMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["orderItems"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};


