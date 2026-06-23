import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../../domain';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuth: boolean;
  role: Role | null;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:       null,
      token:      null,
      isAuth:     false,
      role:       null,
      setSession: (user, token) => {
        localStorage.setItem('stages_token', token);
        set({ user, token, isAuth: true, role: user.role });
      },
      clearSession: () => {
        localStorage.removeItem('stages_token');
        localStorage.removeItem('stages_user');
        set({ user: null, token: null, isAuth: false, role: null });
      },
    }),
    { name: 'stages_user' }
  )
);