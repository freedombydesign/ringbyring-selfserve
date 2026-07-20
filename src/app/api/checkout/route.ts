import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

// POST - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession({
      customerEmail: email,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
