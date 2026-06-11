import apiService from './api';

export type ProductStatus = 'AVAILABLE' | 'DEPOSIT' | 'SOLD';

export type Product = {
  id: number;
  batchId: number;
  imageUrl: string;
  price: number;
  status: ProductStatus;
};

export const getProducts = async () => {
  const response = await apiService.get<Product[]>('/products');
  return response.data;
};

export const updateProduct = async (id: number | string, data: Partial<Product>) => {
  const response = await apiService.put<Product>(`/products/${id}`, data);
  return response.data;
};
