import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

export interface Capital {
  id: number;
  amount: number;
  date: string;
  content: string;
}

export const getCapitals = async (): Promise<Capital[]> => {
  const response = await apiService.get<Capital[]>(API_ENDPOINTS.CAPITAL.BASE);
  return response.data;
};

export const createCapital = async (data: { amount: number; date?: string; content: string }): Promise<Capital> => {
  const response = await apiService.post<Capital>(API_ENDPOINTS.CAPITAL.BASE, data);
  return response.data;
};

export const updateCapital = async (
  id: number,
  data: { amount?: number; date?: string; content?: string }
): Promise<Capital> => {
  const response = await apiService.put<Capital>(API_ENDPOINTS.CAPITAL.DETAIL(id), data);
  return response.data;
};

export const deleteCapital = async (id: number): Promise<void> => {
  await apiService.delete(API_ENDPOINTS.CAPITAL.DETAIL(id));
};

