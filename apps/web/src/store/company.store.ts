import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Company } from '@/types';

interface CompanyState {
  company: Company | null;
  connections: Company[];
  isLoading: boolean;
  error: string | null;
}

interface CompanyActions {
  setCompany: (company: Company) => void;
  updateCompany: (updates: Partial<Company>) => void;
  setConnections: (connections: Company[]) => void;
  addConnection: (company: Company) => void;
  removeConnection: (companyId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const INITIAL: CompanyState = {
  company: null,
  connections: [],
  isLoading: false,
  error: null,
};

export const useCompanyStore = create<CompanyState & CompanyActions>()(
  immer((set) => ({
    ...INITIAL,

    setCompany: (company) => set((s) => { s.company = company; }),

    updateCompany: (updates) => set((s) => {
      if (s.company) Object.assign(s.company, updates);
    }),

    setConnections: (connections) => set((s) => { s.connections = connections; }),

    addConnection: (company) => set((s) => {
      if (!s.connections.find((c) => c.id === company.id)) {
        s.connections.push(company);
      }
    }),

    removeConnection: (companyId) => set((s) => {
      s.connections = s.connections.filter((c) => c.id !== companyId);
    }),

    setLoading: (isLoading) => set((s) => { s.isLoading = isLoading; }),

    setError: (error) => set((s) => { s.error = error; }),

    reset: () => set((s) => { Object.assign(s, INITIAL); }),
  }))
);
