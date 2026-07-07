import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'junior' | 'admin';
  teamId?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  setToken: (token: string) => {
    set({ token });
    localStorage.setItem('token', token);
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ token, user: JSON.parse(user), isAuthenticated: true });
    }
  },
}));
