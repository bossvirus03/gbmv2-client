import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { createCustomer, updateCustomer, deleteCustomer, Customer } from "@/services/customerService";

export const useCreateCustomerMutationBase = (
  options?: UseMutationOptions<Customer, Error, Omit<Customer, 'id'>>
) => {
  return useMutation({
    mutationFn: createCustomer,
    ...options,
  });
};

export const useUpdateCustomerMutationBase = (
  options?: UseMutationOptions<Customer, Error, { id: number; data: Partial<Customer> }>
) => {
  return useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    ...options,
  });
};

export const useDeleteCustomerMutationBase = (
  options?: UseMutationOptions<Customer, Error, number | string>
) => {
  return useMutation({
    mutationFn: deleteCustomer,
    ...options,
  });
};
