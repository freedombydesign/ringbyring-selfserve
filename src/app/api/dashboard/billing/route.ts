import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPortalSession } from '@/lib/stripe';

// POST - Create Stripe portal session
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer's Stripe ID
    const { data: customer, error: customerError } = await supabase
      .from('rbr_customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (customerError || !customer?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      );
    }

    // Create portal session
    const session = await createPortalSession({
      customerId: customer.stripe_customer_id,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing session' },
      { status: 500 }
    );
  }
}
