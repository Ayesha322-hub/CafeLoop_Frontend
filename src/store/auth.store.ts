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

  login: async (email: string, password: string) => {
  set({ isLoading: true });
  try {
    const result = await authApi.login({ email, password });
    console.log('LOGIN RESULT:', JSON.stringify(result, null, 2));
    
    const user: any = await apiClient.get('/users/me');
    set({ user, isAuthenticated: true });
  } catch (err) {
    console.log('LOGIN ERROR:', JSON.stringify(err, null, 2));
    throw err;
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
  try {
    await authApi.logout();
  } catch (err) {
    console.log('Logout API call failed (continuing anyway):', err);
  }
  // Always clear local tokens regardless of API result
  await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  set({ user: null, isAuthenticated: false });
},
}));