import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export const API_BASE = 'http://187.127.88.138:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored JWT on every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // SecureStore unavailable (web/emulator) — continue without token
  }
  return config;
});

// Handle 401 → clear auth and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('accessToken').catch(() => {});
      await SecureStore.deleteItemAsync('user').catch(() => {});
      router.replace('/(auth)/login');
    }
    return Promise.reject(err);
  }
);

// Typed helpers matching web app pattern
export const api = {
  get:    <T>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }).then(r => r.data),
  post:   <T>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data).then(r => r.data),
  patch:  <T>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data).then(r => r.data),
  put:    <T>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data).then(r => r.data),
  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then(r => r.data),
};
