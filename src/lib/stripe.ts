import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const STRIPE_PRICES = {
  pro: 'price_1Qp...',  // Replace with your Stripe price ID
  max: 'price_1Qp...',  // Replace with your Stripe price ID
};

export async function createCheckoutSession(priceId: string) {
  // This would normally call your backend
  // For now, redirect to Stripe checkout
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe not loaded');
  
  // You'll need a backend endpoint to create checkout sessions
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  const session = await response.json();
  return stripe.redirectToCheckout({ sessionId: session.id });
}
