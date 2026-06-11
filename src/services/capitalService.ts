import apiService from './api';

export interface Capital {
  id: number;
  amount: number;
  date: string;
  content: string;
}

export const getCapitals = async (): Promise<Capital[]> => {
  const response = await apiService.get<Capital[]>('/capital');
  return response.data;
};

export const createCapital = async (data: { amount: number; date?: string; content: string }): Promise<Capital> => {
  const response = await apiService.post<Capital>('/capital', data);
  return response.data;
};

export const updateCapital = async (
  id: number,
  data: { amount?: number; date?: string; content?: string }
): Promise<Capital> => {
  const response = await apiService.put<Capital>(`/capital/${id}`, data);
  return response.data;
};

export const deleteCapital = async (id: number): Promise<void> => {
  await apiService.delete(`/capital/${id}`);
};
