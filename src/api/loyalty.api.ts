import apiClient from './client';

export const loyaltyApi = {
  getStatus: () => apiClient.get('/loyalty'),
  getHistory: (page = 1) => apiClient.get('/loyalty/history', { params: { page } }),
  getMyReferralCode: () => apiClient.get('/referrals/my-code'),
};