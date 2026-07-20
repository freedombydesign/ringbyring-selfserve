import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import twilio from 'twilio';

const VoiceResponse = twilio.twiml.VoiceResponse;

// POST - Handle incoming voice call
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const to = formData.get('To') as string; // The RingByRing number that was called
    const from = formData.get('From') as string; // Caller's number
    const callSid = formData.get('CallSid') as string;

    const supabase = createAdminClient();

    // Look up config by the Twilio number that was dialed
    const { data: configResult, error } = await supabase.rpc(
      'rbr_get_config_by_twilio_number',
      { phone_number: to }
    );

    if (error || !configResult || configResult.length === 0) {
      console.error('No config found for number:', to, error);
      // Return a fallback response
      const response = new VoiceResponse();
      response.say(
        {
          voice: 'Polly.Joanna',
        },
        "We're sorry, this number is not currently configured. Please try again later."
      );
      response.hangup();

      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    const config = configResult[0];

    // Log the call start
    await supabase.from('rbr_call_logs').insert({
      customer_id: config.customer_id,
      caller_phone: from,
      outcome: 'message_taken', // Will be updated by status callback
      timestamp: new Date().toISOString(),
    });

    // Build the greeting
    const greeting =
      config.custom_greeting ||
      `Thank you for calling ${config.business_name}. This is RingByRing, your AI assistant. How can I help you today?`;

    // Check if we should connect to the Pipecat server
    const pipecatUrl = process.env.RINGBYRING_PIPECAT_SERVER_URL;

    if (pipecatUrl) {
      // Connect to Pipecat for AI conversation
      const response = new VoiceResponse();

      // Build context object to pass to Pipecat
      const context = {
        business_name: config.business_name,
        industry: config.industry,
        services: config.services,
        qa_pairs: config.qa_pairs,
        notification_email: config.notification_email,
        notification_sms: config.notification_sms,
        caller_phone: from,
        call_sid: callSid,
      };

      // Connect to Pipecat via WebSocket
      const connect = response.connect();
      connect.stream({
        url: `${pipecatUrl}/ws?context=${encodeURIComponent(JSON.stringify(context))}`,
      });

      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Fallback: Simple voice response if no Pipecat server
    const response = new VoiceResponse();
    response.say(
      {
        voice: 'Polly.Joanna',
      },
      greeting
    );

    // Gather caller's message
    const gather = response.gather({
      input: ['speech'],
      action: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/gather?customer_id=${config.customer_id}`,
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US',
    });

    gather.say(
      {
        voice: 'Polly.Joanna',
      },
      'Please leave your name and message, and we will get back to you as soon as possible.'
    );

    // If no input, hang up gracefully
    response.say(
      {
        voice: 'Polly.Joanna',
      },
      'Thank you for calling. Goodbye.'
    );
    response.hangup();

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('Voice webhook error:', error);

    const response = new VoiceResponse();
    response.say(
      {
        voice: 'Polly.Joanna',
      },
      "We're experiencing technical difficulties. Please try again later."
    );
    response.hangup();

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
