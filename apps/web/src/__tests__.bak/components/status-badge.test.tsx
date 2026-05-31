import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/dashboard/status-badge';

describe('<StatusBadge />', () => {
  const cases = [
    { status: 'pending',   fa: 'در انتظار', en: 'Pending' },
    { status: 'approved',  fa: 'تأیید شده', en: 'Approved' },
    { status: 'paid',      fa: 'پرداخت شده', en: 'Paid' },
    { status: 'overdue',   fa: 'معوق', en: 'Overdue' },
    { status: 'cancelled', fa: 'لغو شده', en: 'Cancelled' },
  ];

  cases.forEach(({ status, fa, en }) => {
    it(`renders '${en}' label in English`, () => {
      render(<StatusBadge status={status} lang="en" />);
      expect(screen.getByText(new RegExp(en, 'i'))).toBeInTheDocument();
    });

    it(`renders '${fa}' label in Farsi`, () => {
      render(<StatusBadge status={status} lang="fa" />);
      expect(screen.getByText(fa)).toBeInTheDocument();
    });
  });

  it('renders unknown status gracefully', () => {
    render(<StatusBadge status="unknown_status" lang="en" />);
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
  });
});
