import apiService from './api';

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
  const response = await apiService.post<OrderItem>('/order-items', data);
  return response.data;
};

export const getOrderItems = async () => {
  const response = await apiService.get<OrderItem[]>('/order-items');
  return response.data;
};

export const updateOrderItem = async (id: number | string, data: Partial<Omit<OrderItem, 'id' | 'order'>>) => {
  const response = await apiService.put<OrderItem>(`/order-items/${id}`, data);
  return response.data;
};
