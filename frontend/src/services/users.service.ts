import { api } from './api.service';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  disabled: boolean;
  creationTime: string;
  lastSignInTime: string;
  customClaims: Record<string, unknown>;
}

export interface UpdateUserPayload {
  displayName?: string;
  disabled?: boolean;
  role?: string;
}

export const usersService = {
  async getAll(): Promise<AppUser[]> {
    return api.get<AppUser[]>('/users');
  },
  async getByUid(uid: string): Promise<AppUser> {
    return api.get<AppUser>(`/users/${uid}`);
  },
  async update(uid: string, data: UpdateUserPayload): Promise<AppUser> {
    return api.put<AppUser>(`/users/${uid}`, data);
  },
  async remove(uid: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/users/${uid}`);
  },
};
