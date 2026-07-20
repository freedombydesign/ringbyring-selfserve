#!/usr/bin/env npx ts-node
/**
 * Stripe Setup Script for RingByRing Self-Serve
 *
 * This script programmatically creates:
 * 1. The RingByRing product in Stripe
 * 2. Monthly subscription price ($149/month)
 * 3. Optional setup fee price ($99 one-time)
 * 4. Webhook endpoint for your domain
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_xxx DOMAIN=https://ringbyring.com npx ts-node scripts/setup-stripe.ts
 */

import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DOMAIN = process.env.DOMAIN || 'https://ringbyring.com';

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-06-24.dahlia',
  typescript: true,
});

async function setupStripe() {
  console.log('🚀 Setting up Stripe for RingByRing Self-Serve...\n');
  console.log(`📍 Domain: ${DOMAIN}`);
  console.log(`🔑 Using Stripe key: ${STRIPE_SECRET_KEY?.slice(0, 12)}...${STRIPE_SECRET_KEY?.slice(-4)}\n`);

  // 1. Create the product
  console.log('1️⃣ Creating product...');
  const product = await stripe.products.create({
    name: 'RingByRing AI Receptionist',
    description: 'AI-powered receptionist that answers calls 24/7, takes messages, and captures leads for your business.',
    metadata: {
      app: 'ringbyring_selfserve',
    },
  });
  console.log(`   ✅ Product created: ${product.id}`);

  // 2. Create the monthly subscription price
  console.log('2️⃣ Creating monthly price ($149/month)...');
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 14900, // $149.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      type: 'monthly_subscription',
    },
  });
  console.log(`   ✅ Monthly price created: ${monthlyPrice.id}`);

  // 3. Create optional setup fee (one-time)
  console.log('3️⃣ Creating setup fee price ($99 one-time)...');
  const setupFeePrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 9900, // $99.00 in cents
    currency: 'usd',
    metadata: {
      type: 'setup_fee',
    },
  });
  console.log(`   ✅ Setup fee price created: ${setupFeePrice.id}`);

  // 4. Create webhook endpoint
  console.log('4️⃣ Creating webhook endpoint...');
  const webhookEndpoint = await stripe.webhookEndpoints.create({
    url: `${DOMAIN}/api/webhooks/stripe`,
    enabled_events: [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
    metadata: {
      app: 'ringbyring_selfserve',
    },
  });
  console.log(`   ✅ Webhook endpoint created: ${webhookEndpoint.id}`);

  // Output summary with environment variables
  console.log('\n' + '='.repeat(60));
  console.log('✅ STRIPE SETUP COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📋 Add these environment variables to Vercel:\n');
  console.log(`STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}`);
  console.log(`STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
  console.log(`STRIPE_SETUP_FEE_PRICE_ID=${setupFeePrice.id}`);
  console.log(`STRIPE_WEBHOOK_SECRET=${webhookEndpoint.secret}`);
  console.log(`\n💡 Product ID (for reference): ${product.id}`);
  console.log(`💡 Webhook Endpoint ID: ${webhookEndpoint.id}`);
  console.log('\n' + '='.repeat(60));

  return {
    productId: product.id,
    monthlyPriceId: monthlyPrice.id,
    setupFeePriceId: setupFeePrice.id,
    webhookEndpointId: webhookEndpoint.id,
    webhookSecret: webhookEndpoint.secret,
  };
}

setupStripe()
  .then((result) => {
    console.log('\n🎉 Setup successful! Copy the environment variables above to Vercel.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Check that your STRIPE_SECRET_KEY is valid.');
    }
    process.exit(1);
  });
