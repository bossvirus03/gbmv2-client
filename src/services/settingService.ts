import apiService from './api';

export interface SystemSettings {
  id: number;
  shippingVnPerKg: number;
  exchangeRate: number;
  domesticShippingJpy: number;
  serviceFeeRate: number;
}

export const getSettings = async (): Promise<SystemSettings> => {
  const response = await apiService.get<SystemSettings>('/settings');
  return response.data;
};

export const updateSettings = async (data: {
  shippingVnPerKg?: number;
  exchangeRate?: number;
  domesticShippingJpy?: number;
  serviceFeeRate?: number;
}): Promise<SystemSettings> => {
  const response = await apiService.post<SystemSettings>('/settings', data);
  return response.data;
};
