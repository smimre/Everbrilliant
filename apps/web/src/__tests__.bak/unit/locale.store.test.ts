// ══════════════════════════════════════════════════════════════
// Unit Tests: Locale Store
// ══════════════════════════════════════════════════════════════
import { renderHook, act } from '@testing-library/react';
import { useLocaleStore } from '@/store/locale.store';

describe('useLocaleStore', () => {
  beforeEach(() => {
    useLocaleStore.setState({ lang: 'en', dir: 'ltr' });
  });

  it('should default to English LTR', () => {
    const { result } = renderHook(() => useLocaleStore());
    expect(result.current.lang).toBe('en');
    expect(result.current.dir).toBe('ltr');
  });

  it('should switch to Farsi RTL', () => {
    const { result } = renderHook(() => useLocaleStore());
    act(() => { result.current.setLocale('fa'); });
    expect(result.current.lang).toBe('fa');
    expect(result.current.dir).toBe('rtl');
  });

  it('should switch to Arabic RTL', () => {
    const { result } = renderHook(() => useLocaleStore());
    act(() => { result.current.setLocale('ar'); });
    expect(result.current.dir).toBe('rtl');
  });

  it('should switch to Hindi LTR', () => {
    const { result } = renderHook(() => useLocaleStore());
    act(() => { result.current.setLocale('hi'); });
    expect(result.current.dir).toBe('ltr');
  });
});
