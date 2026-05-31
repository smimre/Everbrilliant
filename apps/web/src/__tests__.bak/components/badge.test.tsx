import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('<Badge />', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass('bg-[hsl(var(--primary)/0.15)]');
  });

  it('applies success variant', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toHaveClass('bg-[hsl(var(--success)/0.15)]');
  });

  it('applies destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    expect(container.firstChild).toHaveClass('bg-[hsl(var(--destructive)/0.15)]');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-class">X</Badge>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
