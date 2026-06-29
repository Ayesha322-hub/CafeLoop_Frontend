import apiClient from './client';

export const paymentsApi = {
  // Step 1: Create Stripe PaymentIntent
  createStripeIntent: (amount: number, orderId: string) =>
    apiClient.post('/payments/stripe/intent', { amount, orderId }),

  // Step 2: Confirm on mobile using Stripe SDK, then place order
  // with stripePaymentIntentId

  // JazzCash
  initJazzCash: (amount: number, orderId: string, mobileNumber: string, userId: string) =>
    apiClient.post('/payments/jazzcash', { amount, orderId, mobileNumber, userId }),
};