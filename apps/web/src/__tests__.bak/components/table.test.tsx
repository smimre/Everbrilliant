import { render, screen, fireEvent } from '@testing-library/react';
import { Table, Column } from '@/components/ui/table';

interface Row { id: number; name: string; status: string; }
const COLS: Column<Row>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'status', header: 'Status', render: v => <span data-testid="status">{v as string}</span> },
];
const DATA: Row[] = [
  { id: 1, name: 'Alpha', status: 'active' },
  { id: 2, name: 'Beta',  status: 'pending' },
];

describe('<Table />', () => {
  it('renders column headers', () => {
    render(<Table columns={COLS} data={DATA} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders all data rows', () => {
    render(<Table columns={COLS} data={DATA} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('uses render function for cells', () => {
    render(<Table columns={COLS} data={DATA} />);
    const badges = screen.getAllByTestId('status');
    expect(badges).toHaveLength(2);
    expect(badges[0].textContent).toBe('active');
  });

  it('shows empty state when data is empty', () => {
    render(<Table columns={COLS} data={[]} emptyTitle="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(<Table columns={COLS} data={[]} loading />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('calls onRowClick when row is clicked', () => {
    const onClick = jest.fn();
    render(<Table columns={COLS} data={DATA} onRowClick={onClick} />);
    fireEvent.click(screen.getByText('Alpha').closest('tr')!);
    expect(onClick).toHaveBeenCalledWith(DATA[0]);
  });

  it('calls onSort when sortable column header clicked', () => {
    const onSort = jest.fn();
    const sortableCols: Column<Row>[] = [
      { ...COLS[0], sortable: true },
      ...COLS.slice(1),
    ];
    render(<Table columns={sortableCols} data={DATA} onSort={onSort} sortKey="" sortDir="asc" />);
    fireEvent.click(screen.getByText('ID'));
    expect(onSort).toHaveBeenCalledWith('id');
  });
});
