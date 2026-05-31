// ══════════════════════════════════════════════════════════════
// Component Tests: Input
// ══════════════════════════════════════════════════════════════
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('<Input />', () => {
  it('renders with label', () => {
    render(<Input label="Phone Number" />);
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input label="Phone" error="Invalid phone" />);
    expect(screen.getByText('Invalid phone')).toBeInTheDocument();
  });

  it('applies error border when error prop set', () => {
    render(<Input error="Required" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-[hsl(var(--destructive))]');
  });

  it('handles value changes', () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '09121111111' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders hint text', () => {
    render(<Input hint="Enter 11 digits" />);
    expect(screen.getByText('Enter 11 digits')).toBeInTheDocument();
  });

  it('does not show hint when error present', () => {
    render(<Input hint="Enter digits" error="Invalid" />);
    expect(screen.queryByText('Enter digits')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });
});
