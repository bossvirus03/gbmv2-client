import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  price: number;
  deposit: number;
  order?: {
    id: number;
    status: string;
    note?: string;
    customerId: number;
    customer?: {
      id: number;
      name: string;
      phone: string;
    }
  }
};

export const createOrderItem = async (data: Omit<OrderItem, 'id' | 'order'>) => {
  const response = await apiService.post<OrderItem>(API_ENDPOINTS.ORDER_ITEM.BASE, data);
  return response.data;
};

export const getOrderItems = async () => {
  const response = await apiService.get<OrderItem[]>(API_ENDPOINTS.ORDER_ITEM.BASE);
  return response.data;
};

export const updateOrderItem = async (id: number | string, data: Partial<Omit<OrderItem, 'id' | 'order'>>) => {
  const response = await apiService.put<OrderItem>(API_ENDPOINTS.ORDER_ITEM.DETAIL(id), data);
  return response.data;
};

