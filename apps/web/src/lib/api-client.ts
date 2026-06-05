// ══════════════════════════════════════════════
// EVERBRILLIANT — API Client
// Axios with interceptors, retry, error handling
// ══════════════════════════════════════════════
import axios, {
  AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '@/types';

const _RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
// api-client appends /api; avoid doubling if env already includes it
const API_URL = _RAW_URL.endsWith('/api') ? _RAW_URL : `${_RAW_URL}/api`;
const REQUEST_TIMEOUT = 15_000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1_000;

// ── Token helpers ─────────────────────────────
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('everbrilliant-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('everbrilliant-auth');
  window.dispatchEvent(new CustomEvent('auth:expired'));
}

// ── Create instance ────────────────────────────
function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // ── Request interceptor ───────────────────
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ── Response interceptor ──────────────────
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiError>) => {
      const config = error.config as AxiosRequestConfig & { _retryCount?: number };

      // Handle 401 — distinguish bad credentials (auth routes) from expired session
      if (error.response?.status === 401) {
        const url = error.config?.url ?? '';
        const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');
        if (isAuthRoute) {
          const message =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Invalid phone number or password';
          return Promise.reject(new Error(Array.isArray(message) ? message[0] : message));
        }
        clearAuth();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      }

      // Retry on network error or 5xx (except 501)
      const isRetryable =
        !error.response ||
        (error.response.status >= 500 && error.response.status !== 501);

      if (isRetryable && (config._retryCount ?? 0) < MAX_RETRIES) {
        config._retryCount = (config._retryCount ?? 0) + 1;
        await new Promise((r) => setTimeout(r, RETRY_DELAY * config._retryCount!));
        return instance(config);
      }

      // Format error message
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Something went wrong';

      return Promise.reject(new Error(message));
    }
  );

  return instance;
}

export const apiClient = createApiClient();

// ── Typed helpers ─────────────────────────────
export const api = {
  get: <T>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, { params, ...config }).then((r) => r.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((r) => r.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((r) => r.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((r) => r.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((r) => r.data),

  upload: <T>(url: string, formData: FormData, onProgress?: (pct: number) => void) =>
    apiClient.post<T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    }).then((r) => r.data),
};
