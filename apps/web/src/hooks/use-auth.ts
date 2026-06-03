'use client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authService } from '@/services/auth.service';
import type { LoginDto, RegisterDto } from '@/types';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const { toast } = useUIStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (result: any) => {
      setAuth(result.user, result.accessToken);
      router.replace('/dashboard');
    },
    onError: (err: any) => {
      toast('error', err?.response?.data?.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const { toast } = useUIStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (result: any) => {
      setAuth(result.user, result.accessToken);
      router.replace('/dashboard');
    },
    onError: (err: any) => {
      toast('error', err?.response?.data?.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  return () => {
    clearAuth();
    router.replace('/login');
  };
}
