import twilio from 'twilio';

// Re-export carrier instructions for backward compatibility
export { CARRIER_INSTRUCTIONS } from './carrier-instructions';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Provision a new phone number for a customer
export async function provisionPhoneNumber({
  customerId,
  areaCode,
}: {
  customerId: string;
  areaCode?: string;
}) {
  // Search for available numbers
  const availableNumbers = await client.availablePhoneNumbers('US')
    .local
    .list({
      areaCode: areaCode ? parseInt(areaCode) : undefined,
      voiceEnabled: true,
      smsEnabled: true,
      limit: 1,
    });

  if (availableNumbers.length === 0) {
    throw new Error('No phone numbers available in the requested area');
  }

  const numberToBuy = availableNumbers[0];

  // Purchase the number
  const purchasedNumber = await client.incomingPhoneNumbers.create({
    phoneNumber: numberToBuy.phoneNumber,
    voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice`,
    voiceMethod: 'POST',
    statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status`,
    statusCallbackMethod: 'POST',
    friendlyName: `Sarah AI - ${customerId}`,
  });

  return {
    phoneNumber: purchasedNumber.phoneNumber,
    sid: purchasedNumber.sid,
  };
}

// Update webhook URLs for a number (used when config changes)
export async function updatePhoneNumberWebhooks({
  numberSid,
  customerId,
}: {
  numberSid: string;
  customerId: string;
}) {
  await client.incomingPhoneNumbers(numberSid).update({
    voiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/voice?customer=${customerId}`,
    voiceMethod: 'POST',
  });
}

// Release a phone number (on cancellation)
export async function releasePhoneNumber(numberSid: string) {
  await client.incomingPhoneNumbers(numberSid).remove();
}

// Make a test call
export async function makeTestCall({
  to,
  from,
  customerId,
}: {
  to: string;
  from: string;
  customerId: string;
}) {
  const call = await client.calls.create({
    to,
    from,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/test-call?customer=${customerId}`,
    method: 'POST',
  });

  return call;
}
