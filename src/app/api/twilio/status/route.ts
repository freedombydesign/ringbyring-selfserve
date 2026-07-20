import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// POST - Twilio status callback
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const duration = formData.get('CallDuration') as string;
    const to = formData.get('To') as string;
    const recordingUrl = formData.get('RecordingUrl') as string | null;

    console.log(`Call ${callSid} status: ${callStatus}, duration: ${duration}s`);

    // Only process completed calls
    if (callStatus !== 'completed') {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    // Look up config by Twilio number
    const { data: configResult } = await supabase.rpc(
      'rbr_get_config_by_twilio_number',
      { phone_number: to }
    );

    if (!configResult || configResult.length === 0) {
      console.log('No config found for completed call to:', to);
      return NextResponse.json({ received: true });
    }

    const config = configResult[0];

    // Update the most recent call log for this customer
    const { error: updateError } = await supabase
      .from('rbr_call_logs')
      .update({
        duration_seconds: parseInt(duration) || 0,
        recording_url: recordingUrl,
      })
      .eq('customer_id', config.customer_id)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error('Failed to update call log:', updateError);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Status callback error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
