import { useOrderItemsQueryBase } from "./orderItems/queries";
import { OrderItem } from "@/services/orderItemService";

export const useOrderItemsQuery = () => {
  return useOrderItemsQueryBase();
};
export type { OrderItem };
