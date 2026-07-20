// Carrier forwarding instructions - client-safe (no server dependencies)

export interface CarrierInstructions {
  carrier: string;
  no_answer_code: string;
  busy_code: string;
  deactivate_code: string;
  instructions: string[];
}

export const CARRIER_INSTRUCTIONS: Record<string, CarrierInstructions> = {
  verizon: {
    carrier: 'Verizon',
    no_answer_code: '*71',
    busy_code: '*90',
    deactivate_code: '*73',
    instructions: [
      'Dial *71 followed by the RingByRing number',
      'Example: *71 555-123-4567',
      'Wait for confirmation tone',
      'To deactivate: dial *73',
    ],
  },
  att: {
    carrier: 'AT&T',
    no_answer_code: '*92',
    busy_code: '*90',
    deactivate_code: '*93',
    instructions: [
      'Dial *92 followed by the RingByRing number',
      'Example: *92 555-123-4567',
      'Wait for confirmation tone',
      'To deactivate: dial *93',
    ],
  },
  tmobile: {
    carrier: 'T-Mobile',
    no_answer_code: '**004*',
    busy_code: '**67*',
    deactivate_code: '##004#',
    instructions: [
      'Dial **004* followed by RingByRing number and #',
      'Example: **004*5551234567#',
      'Wait for confirmation message',
      'To deactivate: dial ##004#',
    ],
  },
  other: {
    carrier: 'Other / Landline',
    no_answer_code: '',
    busy_code: '',
    deactivate_code: '',
    instructions: [
      'Call your carrier customer service',
      'Ask to set up "conditional call forwarding"',
      'Request forwarding for: no answer, busy, and unreachable',
      'Provide them the RingByRing number to forward to',
    ],
  },
};
