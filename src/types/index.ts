// ===========================================
// RingByRing Self-Serve Type Definitions
// ===========================================

export interface Customer {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: 'trialing' | 'active' | 'canceled' | 'past_due' | 'unpaid' | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessConfig {
  id: string;
  customer_id: string;

  // Business basics
  business_name: string;
  business_phone: string; // The number to cover (customer's existing line)
  industry: Industry;
  custom_greeting: string | null; // Optional custom greeting for calls

  // Hours - when RingByRing answers
  business_hours: BusinessHours;
  coverage_mode: 'after_hours' | 'overflow' | 'always' | 'custom';

  // RingByRing's knowledge base
  services: Service[];
  qa_pairs: QAPair[];

  // Notifications - where leads go
  notification_email: string;
  notification_sms: string | null;

  // Provisioned Twilio number (assigned on setup)
  twilio_number: string | null;
  twilio_number_sid: string | null;

  // Status
  status: 'pending_config' | 'pending_forwarding' | 'testing' | 'live' | 'paused';
  setup_completed_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  timezone: string;
  schedule: {
    [key in DayOfWeek]: DaySchedule;
  };
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  is_open: boolean;
  open_time: string | null;  // "09:00"
  close_time: string | null; // "17:00"
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number | null;
  price: string | null; // Free text like "$50" or "Starting at $100"
}

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  category: 'pricing' | 'services' | 'location' | 'general' | 'emergency';
}

export type Industry =
  | 'dental'
  | 'medspa'
  | 'chiropractor'
  | 'trades' // HVAC, plumbing, electrical
  | 'salon'
  | 'auto_repair'
  | 'legal'
  | 'real_estate'
  | 'other';

export interface CallLog {
  id: string;
  customer_id: string;
  timestamp: string;
  duration_seconds: number;
  caller_phone: string;
  caller_name: string | null;
  transcript: TranscriptEntry[];
  outcome: 'message_taken' | 'appointment_booked' | 'transferred' | 'voicemail' | 'hangup';
  message: string | null;
  recording_url: string | null;
  created_at: string;
}

export interface TranscriptEntry {
  speaker: 'ringbyring' | 'caller';
  text: string;
  timestamp: number;
}

// Onboarding wizard state
export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  data: Partial<BusinessConfig>;
}

// Carrier forwarding instructions
export interface CarrierInstructions {
  carrier: string;
  no_answer_code: string;
  busy_code: string;
  deactivate_code: string;
  instructions: string[];
}

// ===========================================
// Programmatic SEO Types (Trade x City pages)
// ===========================================

export interface TradeFAQ {
  q: string;
  a: string;
}

export interface Trade {
  slug: string;
  display_name: string;
  display_plural: string;
  pain_headline: string;
  pain_body: string;
  roi_line: string;
  job_value_note: string;
  demo_greeting: string;
  faqs: TradeFAQ[];
}

export interface TradesData {
  _meta: {
    description: string;
    verification: string;
    last_updated: string;
  };
  trades: Trade[];
}

export interface City {
  slug: string;
  display_name: string;
  region: string;
  province: string;
  area_codes: string[];
  nearby: string[];
  pop_tier: 'small' | 'mid' | 'large';
}

export interface CitiesData {
  _meta: {
    description: string;
    verification: string;
    area_code_note: string;
    last_updated: string;
  };
  cities: City[];
}
