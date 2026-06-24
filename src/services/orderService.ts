import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

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
  const response = await apiService.get<Order[]>(API_ENDPOINTS.ORDER.BASE);
  return response.data;
};

export const getOrderById = async (id: number | string) => {
  const response = await apiService.get<Order>(API_ENDPOINTS.ORDER.DETAIL(id));
  return response.data;
};

export const createOrder = async (data: {
  customerId: number;
  note?: string;
  items?: { productId: number; price: number; deposit: number }[];
  status?: string;
}) => {
  const response = await apiService.post<Order>(API_ENDPOINTS.ORDER.BASE, data);
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
  const response = await apiService.post<Order>(API_ENDPOINTS.ORDER.SELL, data);
  return response.data;
};

export const updateOrder = async (id: number | string, data: Partial<Order>) => {
  const response = await apiService.put<Order>(API_ENDPOINTS.ORDER.DETAIL(id), data);
  return response.data;
};


export const deleteOrder = async (id: number | string) => {
  const response = await apiService.delete(API_ENDPOINTS.ORDER.DETAIL(id));
  return response.data;
};

