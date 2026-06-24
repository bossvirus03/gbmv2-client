import { useQueryClient } from "@tanstack/react-query";
import { useCustomersQueryBase } from "./customers/queries";
import {
  useCreateCustomerMutationBase,
  useUpdateCustomerMutationBase,
  useDeleteCustomerMutationBase,
} from "./customers/mutations";
import { Customer } from "@/services/customerService";

export const useCustomersQuery = () => {
  return useCustomersQueryBase();
};

export const useCreateCustomerMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useCreateCustomerMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateCustomerMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useUpdateCustomerMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteCustomerMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useDeleteCustomerMutationBase({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
export type { Customer };


