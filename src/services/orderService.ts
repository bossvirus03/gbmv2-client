import apiService from './api';

export type OrderStatus = 'DEPOSIT' | 'COMPLETED' | 'CANCELLED';

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  price: number;
  deposit: number;
  product?: {
    id: number;
    imageUrl: string;
    price: number;
    status: string;
    batchId: number;
  };
};

export type Order = {
  id: number;
  status: OrderStatus;
  note?: string;
  customerId: number;
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
  };
  items?: OrderItem[];
};

export const getOrders = async () => {
  const response = await apiService.get<Order[]>('/order');
  return response.data;
};

export const getOrderById = async (id: number | string) => {
  const response = await apiService.get<Order>(`/order/${id}`);
  return response.data;
};

export const createOrder = async (data: { customerId: number; note?: string }) => {
  const response = await apiService.post<Order>('/order', data);
  return response.data;
};

export const createSellOrder = async (data: {
  customerName: string;
  customerPhone?: string;
  productId: number;
  price: number;
  deposit?: number;
  status?: string;
  note?: string;
}) => {
  const response = await apiService.post<Order>('/order/sell', data);
  return response.data;
};

export const updateOrder = async (id: number | string, data: Partial<Order>) => {
  const response = await apiService.put<Order>(`/order/${id}`, data);
  return response.data;
};


export const deleteOrder = async (id: number | string) => {
  const response = await apiService.delete(`/order/${id}`);
  return response.data;
};
