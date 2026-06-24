import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

export type ProductStatus = 'AVAILABLE' | 'DEPOSIT' | 'SOLD';

export type Product = {
  id: number;
  batchId: number;
  imageUrl: string;
  price: number;
  status: ProductStatus;
};

export const getProducts = async () => {
  const response = await apiService.get<Product[]>(API_ENDPOINTS.PRODUCT.BASE);
  return response.data;
};

export const updateProduct = async (id: number | string, data: Partial<Product>) => {
  const response = await apiService.put<Product>(API_ENDPOINTS.PRODUCT.DETAIL(id), data);
  return response.data;
};

