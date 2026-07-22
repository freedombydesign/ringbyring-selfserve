import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { provisionPhoneNumber } from '@/lib/twilio';

// POST - Complete onboarding and provision Twilio number
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

    // Check subscription status
    const { data: customer, error: customerError } = await supabase
      .from('rbr_customers')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    if (customerError || !customer || !['active', 'trialing'].includes(customer.subscription_status || '')) {
      return NextResponse.json(
        { error: 'Subscription required', requires_payment: true },
        { status: 403 }
      );
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

    // Check if already provisioned
    if (config.twilio_number) {
      return NextResponse.json({
        success: true,
        alreadyProvisioned: true,
        twilioNumber: config.twilio_number,
        status: config.status,
      });
    }

    // Validate required fields
    if (!config.business_name || !config.notification_email) {
      return NextResponse.json(
        { error: 'Business name and notification email are required' },
        { status: 400 }
      );
    }

    // Provision Twilio number
    let phoneNumber: string;
    let phoneSid: string;

    try {
      const result = await provisionPhoneNumber({
        customerId: user.id,
        // Could extract area code from business_phone if needed
      });
      phoneNumber = result.phoneNumber;
      phoneSid = result.sid;
    } catch (twilioError) {
      console.error('Twilio provisioning error:', twilioError);
      return NextResponse.json(
        { error: 'Failed to provision phone number. Please try again.' },
        { status: 500 }
      );
    }

    // Update config with provisioned number
    const { error: updateError } = await supabase
      .from('rbr_business_configs')
      .update({
        twilio_number: phoneNumber,
        twilio_number_sid: phoneSid,
        status: 'pending_forwarding',
      })
      .eq('customer_id', user.id);

    if (updateError) {
      console.error('Config update error:', updateError);
      // Phone is provisioned but DB update failed - log for manual fix
      return NextResponse.json(
        { error: 'Phone provisioned but failed to save. Contact support.' },
        { status: 500 }
      );
    }

    // Update onboarding progress
    await supabase
      .from('rbr_onboarding_progress')
      .update({
        current_step: 5,
        completed_steps: [1, 2, 3, 4],
      })
      .eq('customer_id', user.id);

    return NextResponse.json({
      success: true,
      twilioNumber: phoneNumber,
      status: 'pending_forwarding',
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
