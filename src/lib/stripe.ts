import Stripe from 'stripe';

// Lazy-initialized Stripe client (allows build without env vars)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return _stripe;
}

// Legacy export for backwards compatibility
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
};

// Create checkout session for new customer
export async function createCheckoutSession({
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer_email: customerEmail,
    line_items: [
      // Setup fee (one-time)
      ...(process.env.STRIPE_SETUP_FEE_PRICE_ID
        ? [
            {
              price: process.env.STRIPE_SETUP_FEE_PRICE_ID,
              quantity: 1,
            },
          ]
        : []),
      // Monthly subscription
      {
        price: process.env.STRIPE_MONTHLY_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      product: 'ringbyring_selfserve',
    },
    subscription_data: {
      metadata: {
        product: 'ringbyring_selfserve',
      },
    },
  });

  return session;
}

// Get customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
