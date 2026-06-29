import apiClient from './client';

export interface AddToCartPayload {
  cafeId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  customizations?: Record<string, string>;
}

export const cartApi = {
  getCart: () =>
    apiClient.get('/cart'),

  addItem: (payload: AddToCartPayload) =>
    apiClient.post('/cart/items', payload),

  updateItem: (itemId: string, quantity: number) =>
    apiClient.patch(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    apiClient.delete(`/cart/items/${itemId}`),

  clearCart: () =>
    apiClient.delete('/cart'),

  validateCoupon: (code: string, subtotal: number) =>
    apiClient.post('/cart/coupon', { code, subtotal }),
};