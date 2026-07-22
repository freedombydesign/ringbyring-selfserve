import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has subscription and onboarding status
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check subscription status
        const { data: customer } = await supabase
          .from('rbr_customers')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        // If no subscription or not active/trialing, redirect to landing page
        if (!customer || !['active', 'trialing'].includes(customer.subscription_status || '')) {
          return NextResponse.redirect(`${origin}/`);
        }

        // Check if user has completed onboarding
        const { data: config } = await supabase
          .from('rbr_business_configs')
          .select('status')
          .eq('customer_id', user.id)
          .single();

        // If user is already live, redirect to dashboard
        if (config?.status === 'live') {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      }

      // Otherwise redirect to onboarding (user has subscription but hasn't completed setup)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
