import apiService from './api';

export interface R2StorageStats {
  usedBytes: number;
  totalBytes: number;
  remainingBytes: number;
  usedPercentage: number;
  maxGb: number;
}

export const getR2StorageStats = async (forceRefresh = false): Promise<R2StorageStats> => {
  const response = await apiService.get<R2StorageStats>(`/r2/storage?refresh=${forceRefresh}`);
  return response.data;
};
