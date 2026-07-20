import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { makeTestCall } from '@/lib/twilio';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

// POST - Initiate a test call
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Get customer's config
    const { data: config, error: configError } = await supabase
      .from('rbr_business_configs')
      .select('*')
      .eq('customer_id', user.id)
      .single();

    if (configError || !config || !config.twilio_number) {
      return NextResponse.json(
        { error: 'No provisioned number found' },
        { status: 404 }
      );
    }

    // Make the test call
    const call = await makeTestCall({
      to: phoneNumber,
      from: config.twilio_number,
      customerId: user.id,
    });

    // Update status to testing
    await supabase
      .from('rbr_business_configs')
      .update({ status: 'testing' })
      .eq('customer_id', user.id);

    return NextResponse.json({
      success: true,
      callSid: call.sid,
    });
  } catch (error) {
    console.error('Test call error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate test call' },
      { status: 500 }
    );
  }
}

// GET - TwiML for test call (what the caller hears)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get('customer');

  const supabase = createClient();
  let config;

  if (customerId) {
    const { data } = await (await supabase)
      .from('rbr_business_configs')
      .select('*')
      .eq('customer_id', customerId)
      .single();
    config = data;
  }

  const response = new VoiceResponse();

  if (config) {
    const greeting =
      config.custom_greeting ||
      `Thank you for calling ${config.business_name}. This is RingByRing, your AI assistant. How can I help you today?`;

    response.say(
      {
        voice: 'Polly.Joanna',
      },
      greeting
    );

    response.pause({ length: 1 });

    response.say(
      {
        voice: 'Polly.Joanna',
      },
      'This is a test call. Your RingByRing setup is working correctly. You can now go live and start receiving calls. Goodbye!'
    );
  } else {
    response.say(
      {
        voice: 'Polly.Joanna',
      },
      'This is a test call from RingByRing. Your setup appears to be working. Goodbye!'
    );
  }

  response.hangup();

  return new NextResponse(response.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
