// ══════════════════════════════════════════════════════════════
// Unit Tests: Auth Store (Zustand)
// ══════════════════════════════════════════════════════════════
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/store/auth.store';

const MOCK_USER = {
  id: 1, name: 'Ahmad', phone: '09121111111',
  role: 'company_admin', companyId: 1,
  permissions: ['req_view', 'invoice_create'],
  isCompanyAdmin: true,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null, accessToken: null, refreshToken: null,
      isAuthenticated: false, isLoading: false,
    });
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should set auth state on setAuth()', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setAuth(MOCK_USER, 'token123'); });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('Ahmad');
    expect(result.current.accessToken).toBe('token123');
  });

  it('should clear auth state on clearAuth()', () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => { result.current.setAuth(MOCK_USER, 'token123'); });
    act(() => { result.current.clearAuth(); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  describe('hasPermission()', () => {
    it('should return true for company_admin on any permission', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => { result.current.setAuth(MOCK_USER, 'token'); });
      expect(result.current.hasPermission('any_permission')).toBe(true);
    });

    it('should return true for specific permission', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        result.current.setAuth({ ...MOCK_USER, role: 'viewer' }, 'token');
      });
      expect(result.current.hasPermission('req_view')).toBe(true);
    });

    it('should return false for missing permission', () => {
      const { result } = renderHook(() => useAuthStore());
      act(() => {
        result.current.setAuth({ ...MOCK_USER, role: 'viewer', permissions: ['req_view'] }, 'token');
      });
      expect(result.current.hasPermission('admin_full')).toBe(false);
    });
  });
});
