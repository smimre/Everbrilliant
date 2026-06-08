import { api } from '@/lib/api-client';
import type { User, LoginDto, RegisterDto, AuthTokens } from '@/types';

interface LoginResponse extends AuthTokens { user: User; }
interface RegisterResponse extends AuthTokens { user: Pick<User, 'id' | 'name' | 'phone'>; }

export const authService = {
  login: (dto: LoginDto) => api.post<LoginResponse>('/auth/login', dto),
  sendOtp: (phone: string) => api.post<{ message: string }>('/auth/send-otp', { phone }),
  register: (dto: RegisterDto) => api.post<RegisterResponse>('/auth/register', dto),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  updateProfile: (dto: { name?: string; email?: string }) =>
    api.patch<User>('/auth/me', dto),
  changePassword: (dto: { currentPassword: string; newPassword: string }) =>
    api.patch<{ message: string }>('/auth/change-password', dto),
  forgotPassword: (identifier: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { identifier }),
  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, password }),
  getCompany: () => api.get<any>('/auth/company'),
  updateCompany: (dto: Record<string, any>) => api.patch<any>('/auth/company', dto),
};
