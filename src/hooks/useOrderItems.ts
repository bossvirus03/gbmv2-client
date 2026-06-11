import { useQuery } from "@tanstack/react-query";
import { getOrderItems, OrderItem } from "@/services/orderItemService";

export const useOrderItemsQuery = () => {
  return useQuery<OrderItem[]>({
    queryKey: ["orderItems"],
    queryFn: getOrderItems,
  });
};
