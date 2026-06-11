import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, Customer } from "@/services/customerService";

export const useCustomersQuery = () => {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
};

export const useCreateCustomerMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useUpdateCustomerMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};

export const useDeleteCustomerMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccessCallback) onSuccessCallback();
    },
  });
};
