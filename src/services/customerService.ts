import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

export type Customer = {
  id: number;
  name: string;
  phone: string;
};

export const getCustomers = async () => {
  const response = await apiService.get<Customer[]>(API_ENDPOINTS.CUSTOMER.BASE);
  return response.data;
};

export const getCustomerById = async (id: number | string) => {
  const response = await apiService.get<Customer>(API_ENDPOINTS.CUSTOMER.DETAIL(id));
  return response.data;
};

export const createCustomer = async (data: Omit<Customer, 'id'>) => {
  const response = await apiService.post<Customer>(API_ENDPOINTS.CUSTOMER.BASE, data);
  return response.data;
};

export const updateCustomer = async (id: number | string, data: Partial<Customer>) => {
  const response = await apiService.put<Customer>(API_ENDPOINTS.CUSTOMER.DETAIL(id), data);
  return response.data;
};

export const deleteCustomer = async (id: number | string) => {
  const response = await apiService.delete(API_ENDPOINTS.CUSTOMER.DETAIL(id));
  return response.data;
};

