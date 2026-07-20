import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST - Mark business as live
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

    // Get current config
    const { data: config, error: configError } = await supabase
      .from('rbr_business_configs')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { error: 'Business config not found' },
        { status: 404 }
      );
    }

    // Verify prerequisites
    if (!config.twilio_number) {
      return NextResponse.json(
        { error: 'Phone number not provisioned yet' },
        { status: 400 }
      );
    }

    // Update status to live
    const { error: updateError } = await supabase
      .from('rbr_business_configs')
      .update({
        status: 'live',
        setup_completed_at: new Date().toISOString(),
      })
      .eq('customer_id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Update onboarding progress
    await supabase
      .from('rbr_onboarding_progress')
      .update({
        current_step: 6,
        completed_steps: [1, 2, 3, 4, 5, 6],
      })
      .eq('customer_id', user.id);

    return NextResponse.json({
      success: true,
      status: 'live',
      twilioNumber: config.twilio_number,
    });
  } catch (error) {
    console.error('Go live error:', error);
    return NextResponse.json({ error: 'Failed to go live' }, { status: 500 });
  }
}
