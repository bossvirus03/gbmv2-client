import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getCustomers, Customer } from "@/services/customerService";

export const useCustomersQueryBase = (options?: Omit<UseQueryOptions<Customer[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: getCustomers,
    ...options,
  });
};
