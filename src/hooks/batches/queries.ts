import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getBatches, Batch } from "@/services/batchService";
import { getOrderItems, OrderItem } from "@/services/orderItemService";

export const useBatchesQueryBase = (options?: Omit<UseQueryOptions<Batch[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: getBatches,
    ...options,
  });
};

export const useOrderItemsQueryBase = (options?: Omit<UseQueryOptions<OrderItem[], Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<OrderItem[]>({
    queryKey: ["orderItems"],
    queryFn: getOrderItems,
    ...options,
  });
};
