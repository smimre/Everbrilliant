import { api } from '@/lib/api-client';
import type { Letter, WorkflowRequest, Meeting, Approval, PaginatedResponse, PaginationQuery } from '@/types';

export const automationService = {
  // Letters
  getLetters: (query?: PaginationQuery & { type?: string }) =>
    api.get<PaginatedResponse<Letter>>('/automation/letters', query as Record<string, unknown>),
  getLetter: (id: string) => api.get<Letter>(`/automation/letters/${id}`),
  createLetter: (dto: Omit<Letter, 'id' | 'companyId' | 'createdAt'>) =>
    api.post<Letter>('/automation/letters', dto),
  archiveLetter: (id: string) => api.patch(`/automation/letters/${id}/archive`),

  // Workflow Requests
  getRequests: (query?: PaginationQuery & { status?: string }) =>
    api.get<PaginatedResponse<WorkflowRequest>>('/automation/requests', query as Record<string, unknown>),
  createRequest: (dto: Omit<WorkflowRequest, 'id' | 'requesterId' | 'companyId' | 'approvals' | 'createdAt'>) =>
    api.post<WorkflowRequest>('/automation/requests', dto),
  approveRequest: (id: string, comment?: string) =>
    api.patch<Approval>(`/automation/requests/${id}/approve`, { comment }),
  rejectRequest: (id: string, comment?: string) =>
    api.patch<Approval>(`/automation/requests/${id}/reject`, { comment }),

  // Meetings
  getMeetings: (query?: PaginationQuery) => api.get<PaginatedResponse<Meeting>>('/automation/meetings', query as Record<string, unknown>),
  createMeeting: (dto: Omit<Meeting, 'id' | 'companyId' | 'createdAt'>) =>
    api.post<Meeting>('/automation/meetings', dto),
  addMinutes: (id: string, minutes: string) => api.patch(`/automation/meetings/${id}/minutes`, { minutes }),
};
