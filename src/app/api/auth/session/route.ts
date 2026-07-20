import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Check current session
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    // Get customer data
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get business config
    const { data: config } = await supabase
      .from('business_configs')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    // Get onboarding progress
    const { data: progress } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      customer,
      config,
      onboardingProgress: progress,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}
