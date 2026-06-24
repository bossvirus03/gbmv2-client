import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

export interface SystemSettings {
  id: number;
  shippingVnPerKg: number;
  exchangeRate: number;
  domesticShippingJpy: number;
  serviceFeeRate: number;
}

export const getSettings = async (): Promise<SystemSettings> => {
  const response = await apiService.get<SystemSettings>(API_ENDPOINTS.SETTING.BASE);
  return response.data;
};

export const updateSettings = async (data: {
  shippingVnPerKg?: number;
  exchangeRate?: number;
  domesticShippingJpy?: number;
  serviceFeeRate?: number;
}): Promise<SystemSettings> => {
  const response = await apiService.post<SystemSettings>(API_ENDPOINTS.SETTING.BASE, data);
  return response.data;
};

