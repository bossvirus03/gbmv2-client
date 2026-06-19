/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { clearAccessToken, getAccessToken } from '../lib/asyncLocalstoragate';

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_URL as string | undefined) || 'http://localhost:3000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            return this.api(originalRequest);
          } catch (refreshError) {
            clearAccessToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }

  public upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, formData, {
      timeout: 60000, // Tăng timeout cho tác vụ upload lên 60 giây
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(config?.headers || {}),
      },
    });
  }
}

// Export instance
const apiService = new ApiService();
export default apiService;