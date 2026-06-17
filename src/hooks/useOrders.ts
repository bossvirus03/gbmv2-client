import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/services/orderService";

export const useCreateOrderMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["orderItems"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
