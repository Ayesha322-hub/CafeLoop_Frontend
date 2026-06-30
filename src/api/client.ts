import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//export const BASE_URL = __DEV__
 // ? 'http://192.168.100.44:3000/api/v1'      // local development
  //: 'https://cafe-loop-app.vercel.app/api/v1'; // production

export const BASE_URL = 'https://cafe-loop-app.vercel.app/api/v1';
  
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── REQUEST INTERCEPTOR ──────────────────────────────────────
// Attach JWT token to every request automatically
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────
// Unwrap { success: true, data: {...} } envelope automatically
// So every API call returns data directly without .data.data
apiClient.interceptors.response.use(
  (response) => {
    return response.data.data; // ← unwrap envelope
  },

  async (error) => {
    const originalRequest = error.config;

    // Token expired → try refresh automatically
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = res.data.data;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefresh);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (err) {
        // Refresh failed → clear tokens → user needs to login again
        await Promise.all([
          AsyncStorage.removeItem('accessToken'),
          AsyncStorage.removeItem('refreshToken'),
        ]);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error?.response?.data || error.message);
  }
);

export default apiClient;