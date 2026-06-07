import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    // Request interceptor — attach token
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('everbrilliant-auth');
          if (stored) {
            const { state } = JSON.parse(stored);
            if (state?.accessToken) {
              config.headers.Authorization = `Bearer ${state.accessToken}`;
            }
          }
        } catch {}
      }
      return config;
    });

    // Response interceptor — handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ error?: string; message?: string }>) => {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Something went wrong';

        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('everbrilliant-auth');
            window.location.href = '/login';
          }
        }

        return Promise.reject(new Error(message));
      }
    );
  }

  get<T>(url: string, params?: Record<string, unknown>) {
    return this.client.get<T>(url, { params }).then((r) => r.data);
  }
  post<T>(url: string, data?: unknown) {
    return this.client.post<T>(url, data).then((r) => r.data);
  }
  patch<T>(url: string, data?: unknown) {
    return this.client.patch<T>(url, data).then((r) => r.data);
  }
  put<T>(url: string, data?: unknown) {
    return this.client.put<T>(url, data).then((r) => r.data);
  }
  delete<T>(url: string) {
    return this.client.delete<T>(url).then((r) => r.data);
  }
}

export const api = new ApiClient();
