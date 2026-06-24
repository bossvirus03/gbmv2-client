import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

export type User = {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
};

export const getUsers = async () => {
  const response = await apiService.get<User[]>(API_ENDPOINTS.USER.BASE);
  return response.data;
};

export const createUser = async (data: { email: string }) => {
  const response = await apiService.post<User>(API_ENDPOINTS.USER.BASE, data);
  return response.data;
};

export const deleteUser = async (id: number | string) => {
  const response = await apiService.delete(API_ENDPOINTS.USER.DETAIL(id));
  return response.data;
};

