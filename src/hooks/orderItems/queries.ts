import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getOrderItems, OrderItem } from "@/services/orderItemService";

export const useOrderItemsQueryBase = (options?: Omit<UseQueryOptions<OrderItem[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<OrderItem[]>({
    queryKey: ["orderItems"],
    queryFn: getOrderItems,
    ...options,
  });
};
