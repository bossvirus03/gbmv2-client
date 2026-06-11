import apiService from './api';

export type Customer = {
  id: number;
  name: string;
  phone: string;
};

export const getCustomers = async () => {
  const response = await apiService.get<Customer[]>('/customers');
  return response.data;
};

export const getCustomerById = async (id: number | string) => {
  const response = await apiService.get<Customer>(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: Omit<Customer, 'id'>) => {
  const response = await apiService.post<Customer>('/customers', data);
  return response.data;
};

export const updateCustomer = async (id: number | string, data: Partial<Customer>) => {
  const response = await apiService.put<Customer>(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id: number | string) => {
  const response = await apiService.delete(`/customers/${id}`);
  return response.data;
};
