import apiClient from './client';

export interface CafeFilter {
  search?: string;
  category?: string;
  lat?: number;
  lng?: number;
  openNow?: boolean;
  sortBy?: 'rating' | 'distance' | 'orders';
  page?: number;
  limit?: number;
}

export const cafesApi = {
  getAll: (filter: CafeFilter = {}) =>
    apiClient.get('/cafes', { params: filter }),

  getOne: (id: string) =>
    apiClient.get(`/cafes/${id}`),

  getMenu: (cafeId: string, category?: string) =>
    apiClient.get(`/cafes/${cafeId}/menu`, { params: { category } }),

  toggleFavorite: (cafeId: string) =>
    apiClient.post(`/cafes/${cafeId}/favorite`),

  getFavorites: () =>
    apiClient.get('/cafes/my/favorites'),
};