import apiService from './api';

export type User = {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
};

export const getUsers = async () => {
  const response = await apiService.get<User[]>('/user');
  return response.data;
};

export const createUser = async (data: { email: string }) => {
  const response = await apiService.post<User>('/user', data);
  return response.data;
};

export const deleteUser = async (id: number | string) => {
  const response = await apiService.delete(`/user/${id}`);
  return response.data;
};
