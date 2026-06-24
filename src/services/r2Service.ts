import apiService from './api';
import { API_ENDPOINTS } from './apiEndpoints';

export interface R2StorageStats {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  usedPercentage: number;
  maxGb: number;
}

export const getR2StorageStats = async (forceRefresh = false): Promise<R2StorageStats> => {
  const response = await apiService.get<R2StorageStats>(`${API_ENDPOINTS.R2.STORAGE}?refresh=${forceRefresh}`);
  return response.data;
};

