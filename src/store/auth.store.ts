import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth.api';
import apiClient from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  loyaltyPoints: number;
  referralCode: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  loadUser: async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;
    try {
      const user = await apiClient.get('/users/me');
      set({ user: user as any, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      await authApi.login({ email, password });
      const user = await apiClient.get('/users/me');
      set({ user: user as any, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      await authApi.register(payload);
      const user = await apiClient.get('/users/me');
      set({ user: user as any, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },
}));