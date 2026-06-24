import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { createOrder } from "@/services/orderService";

export const useCreateOrderMutationBase = (
  options?: UseMutationOptions<any, Error,Parameters<typeof createOrder>[0]>
) => {
  return useMutation({
    mutationFn: createOrder,
    ...options,
  });
};
