import apiClient from './client';

export interface CreateOrderPayload {
  cafeId: string;
  orderType: 'pickup' | 'dine_in' | 'delivery';
  paymentMethod: 'stripe' | 'jazzcash' | 'cash';
  useLoyaltyPoints?: boolean;
  couponCode?: string;
  stripePaymentIntentId?: string;
  jazzCashTxnRef?: string;
  notes?: string;
}

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    apiClient.post('/orders', payload),

  getOne: (orderId: string) =>
    apiClient.get(`/orders/${orderId}`),

  cancel: (orderId: string) =>
    apiClient.post(`/orders/${orderId}/cancel`),
};