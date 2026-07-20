import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

// Verify webhook signature and return event
async function verifyWebhookSignature(
  request: NextRequest
): Promise<Stripe.Event | null> {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing stripe-signature header');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const event = await verifyWebhookSignature(request);

  if (!event) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle successful checkout - create customer record
async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  session: Stripe.Checkout.Session
) {
  const customerEmail = session.customer_email;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!customerEmail) {
    throw new Error('No customer email in checkout session');
  }

  // Check if user already exists in auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(
    (u) => u.email === customerEmail
  );

  let userId: string;

  if (existingUser) {
    // User already exists, update their customer record
    userId = existingUser.id;
  } else {
    // Create new user with magic link auth
    const { data: newUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true, // Auto-confirm since they paid
      });

    if (authError || !newUser.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    userId = newUser.user.id;
  }

  // Upsert customer record
  const { error: customerError } = await supabase.from('customers').upsert(
    {
      id: userId,
      email: customerEmail,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: 'active',
    },
    {
      onConflict: 'id',
    }
  );

  if (customerError) {
    throw new Error(`Failed to create customer: ${customerError.message}`);
  }

  // Create initial business_configs record (pending_config status)
  const { error: configError } = await supabase.from('business_configs').upsert(
    {
      customer_id: userId,
      business_name: '', // Will be filled in wizard
      industry: 'other',
      notification_email: customerEmail,
      status: 'pending_config',
    },
    {
      onConflict: 'customer_id',
    }
  );

  if (configError) {
    throw new Error(`Failed to create business config: ${configError.message}`);
  }

  // Create onboarding_progress record
  const { error: progressError } = await supabase
    .from('onboarding_progress')
    .upsert(
      {
        customer_id: userId,
        current_step: 1,
        completed_steps: [],
        draft_data: {},
      },
      {
        onConflict: 'customer_id',
      }
    );

  if (progressError) {
    console.error('Failed to create onboarding progress:', progressError);
    // Non-fatal, continue
  }

  // Send magic link email so user can log in
  const { error: magicLinkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: customerEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    },
  });

  if (magicLinkError) {
    console.error('Failed to send magic link:', magicLinkError);
    // Non-fatal, user can request login manually
  }

  console.log(`Checkout completed for ${customerEmail}, user ${userId}`);
}

// Handle subscription updates (upgrade, downgrade, payment issues)
async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const stripeSubscriptionId = subscription.id;
  const status = subscription.status;

  const { error } = await supabase
    .from('customers')
    .update({ subscription_status: status })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  console.log(`Subscription ${stripeSubscriptionId} updated to ${status}`);
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const stripeSubscriptionId = subscription.id;

  // Update customer status
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .update({ subscription_status: 'canceled' })
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .select()
    .single();

  if (customerError) {
    throw new Error(`Failed to cancel subscription: ${customerError.message}`);
  }

  // Pause the business config (stop answering calls)
  if (customer) {
    await supabase
      .from('business_configs')
      .update({ status: 'paused' })
      .eq('customer_id', customer.id);
  }

  console.log(`Subscription ${stripeSubscriptionId} canceled`);
}
