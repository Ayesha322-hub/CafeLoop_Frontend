import apiClient from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  referredBy?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// ── Token helpers ────────────────────────────────
const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';

export const saveTokens = async (tokens: AuthResponse) => {
  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN, tokens.accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN, tokens.refreshToken),
  ]);
};

export const clearTokens = async () => {
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN),
    AsyncStorage.removeItem(REFRESH_TOKEN),
  ]);
};

// ── API ───────────────────────────────────────────
export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);

    await saveTokens(res.data);
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);

    await saveTokens(res.data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    await clearTokens();
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/google/mobile', {
      idToken,
    });

    await saveTokens(res.data);
    return res.data;
  },
};