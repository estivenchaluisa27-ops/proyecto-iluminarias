import type { Luminaria, LuminariaStats } from '../types/luminaria';
import { api } from './api.service';

export const luminariasService = {
  getAll: () => api.get<Luminaria[]>('/luminarias'),
  getById: (id: number) => api.get<Luminaria>(`/luminarias/${id}`),
  getStats: () => api.get<LuminariaStats>('/luminarias/stats'),
  create: (data: Partial<Luminaria>) => api.post<Luminaria>('/luminarias', data),
  update: (id: number, data: Partial<Luminaria>) =>
    api.put<Luminaria>(`/luminarias/${id}`, data),
  remove: (id: number) => api.delete<{ message: string }>(`/luminarias/${id}`),
};
