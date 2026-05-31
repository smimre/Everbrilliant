import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/ui/modal';

const FOOTER = <button>Confirm</button>;

describe('<Modal />', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={jest.fn()} title="Test">{null}</Modal>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title when open', () => {
    render(<Modal open onClose={jest.fn()} title="My Modal">Content</Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<Modal open onClose={jest.fn()} title="T" description="A description">x</Modal>);
    expect(screen.getByText('A description')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Modal open onClose={jest.fn()} title="T"><p>Child content</p></Modal>);
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<Modal open onClose={jest.fn()} title="T" footer={FOOTER}>x</Modal>);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('calls onClose when X button clicked', () => {
    const onClose = jest.fn();
    render(<Modal open onClose={onClose} title="T">x</Modal>);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key', () => {
    const onClose = jest.fn();
    render(<Modal open onClose={onClose} title="T">x</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on backdrop click when closeOnBackdrop=false', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="T" closeOnBackdrop={false}>
        <div>inner</div>
      </Modal>
    );
    // backdrop is the first child overlay div
    const backdrop = document.querySelector('.fixed.inset-0.z-50 > div:first-child');
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });
});
