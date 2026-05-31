import { render, screen, act } from '@testing-library/react';
import { ToastContainer } from '@/components/ui/toast';
import { useUIStore } from '@/store/ui.store';

describe('<ToastContainer />', () => {
  beforeEach(() => {
    useUIStore.setState({ toasts: [] });
  });

  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders success toast', () => {
    act(() => {
      useUIStore.getState().toast('success', 'Operation successful');
    });
    render(<ToastContainer />);
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    act(() => {
      useUIStore.getState().toast('error', 'Something went wrong');
    });
    render(<ToastContainer />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    act(() => {
      useUIStore.getState().toast('success', 'First');
      useUIStore.getState().toast('error', 'Second');
    });
    render(<ToastContainer />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('removes toast when X clicked', () => {
    act(() => {
      useUIStore.getState().addToast({ type: 'info', message: 'Removable', duration: 0 });
    });
    render(<ToastContainer />);
    const closeBtn = screen.getByRole('button');
    act(() => closeBtn.click());
    expect(screen.queryByText('Removable')).not.toBeInTheDocument();
  });
});
