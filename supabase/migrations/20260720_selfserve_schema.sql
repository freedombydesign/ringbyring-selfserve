-- ===========================================
-- Sarah AI Self-Serve Database Schema
-- ===========================================
-- This schema supports the self-serve onboarding flow:
-- Signup -> Payment -> Config -> Provisioning -> Go Live
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. CUSTOMERS TABLE
-- Links auth.users to Stripe and tracks subscription
-- ===========================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT CHECK (subscription_status IN (
    'trialing', 'active', 'canceled', 'past_due', 'unpaid', NULL
  )),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 2. BUSINESS CONFIG TABLE
-- Core configuration that Sarah uses on calls
-- ===========================================
CREATE TABLE IF NOT EXISTS public.business_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,

  -- Business basics
  business_name TEXT NOT NULL,
  business_phone TEXT, -- Customer's existing number to cover
  industry TEXT NOT NULL CHECK (industry IN (
    'dental', 'medspa', 'chiropractor', 'trades',
    'salon', 'auto_repair', 'legal', 'real_estate', 'other'
  )),

  -- Business hours (JSONB for flexibility)
  business_hours JSONB DEFAULT '{
    "timezone": "America/New_York",
    "schedule": {
      "monday": {"is_open": true, "open_time": "09:00", "close_time": "17:00"},
      "tuesday": {"is_open": true, "open_time": "09:00", "close_time": "17:00"},
      "wednesday": {"is_open": true, "open_time": "09:00", "close_time": "17:00"},
      "thursday": {"is_open": true, "open_time": "09:00", "close_time": "17:00"},
      "friday": {"is_open": true, "open_time": "09:00", "close_time": "17:00"},
      "saturday": {"is_open": false, "open_time": null, "close_time": null},
      "sunday": {"is_open": false, "open_time": null, "close_time": null}
    }
  }'::jsonb,

  -- When Sarah answers
  coverage_mode TEXT NOT NULL DEFAULT 'after_hours' CHECK (coverage_mode IN (
    'after_hours', 'overflow', 'always', 'custom'
  )),

  -- Sarah's knowledge base
  services JSONB DEFAULT '[]'::jsonb,
  qa_pairs JSONB DEFAULT '[]'::jsonb,

  -- Where leads go
  notification_email TEXT NOT NULL,
  notification_sms TEXT,

  -- Provisioned Twilio number
  twilio_number TEXT UNIQUE,
  twilio_number_sid TEXT UNIQUE,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending_config' CHECK (status IN (
    'pending_config', 'pending_forwarding', 'testing', 'live', 'paused'
  )),
  setup_completed_at TIMESTAMP WITH TIME ZONE,

  -- Custom greeting (optional override)
  custom_greeting TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One config per customer
  UNIQUE(customer_id)
);

-- ===========================================
-- 3. CALL LOGS TABLE
-- Records of calls Sarah handled
-- ===========================================
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,

  -- Call metadata
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL DEFAULT 0,

  -- Caller info
  caller_phone TEXT NOT NULL,
  caller_name TEXT,

  -- Transcript
  transcript JSONB DEFAULT '[]'::jsonb,

  -- Outcome
  outcome TEXT NOT NULL DEFAULT 'message_taken' CHECK (outcome IN (
    'message_taken', 'appointment_booked', 'transferred', 'voicemail', 'hangup'
  )),
  message TEXT,

  -- Recording (if enabled)
  recording_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- 4. ONBOARDING PROGRESS TABLE
-- Tracks wizard completion for resumability
-- ===========================================
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,

  current_step INTEGER NOT NULL DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',

  -- Partial data (saved as user progresses)
  draft_data JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(customer_id)
);

-- ===========================================
-- 5. INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe ON public.customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_business_configs_customer ON public.business_configs(customer_id);
CREATE INDEX IF NOT EXISTS idx_business_configs_twilio ON public.business_configs(twilio_number);
CREATE INDEX IF NOT EXISTS idx_business_configs_status ON public.business_configs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_customer ON public.call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_timestamp ON public.call_logs(timestamp DESC);

-- ===========================================
-- 6. ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Customers can only see/edit their own data
CREATE POLICY "Users can view own customer record"
  ON public.customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own customer record"
  ON public.customers FOR UPDATE
  USING (auth.uid() = id);

-- Business config policies
CREATE POLICY "Users can view own config"
  ON public.business_configs FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own config"
  ON public.business_configs FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own config"
  ON public.business_configs FOR UPDATE
  USING (auth.uid() = customer_id);

-- Call logs policies
CREATE POLICY "Users can view own call logs"
  ON public.call_logs FOR SELECT
  USING (auth.uid() = customer_id);

-- Onboarding progress policies
CREATE POLICY "Users can view own onboarding"
  ON public.onboarding_progress FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own onboarding"
  ON public.onboarding_progress FOR UPDATE
  USING (auth.uid() = customer_id);

-- ===========================================
-- 7. FUNCTIONS & TRIGGERS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER business_configs_updated_at
  BEFORE UPDATE ON public.business_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- 8. HELPER FUNCTION: Get config by Twilio number
-- Used by the call routing to load customer context
-- ===========================================
CREATE OR REPLACE FUNCTION get_config_by_twilio_number(phone_number TEXT)
RETURNS TABLE (
  customer_id UUID,
  business_name TEXT,
  industry TEXT,
  business_hours JSONB,
  services JSONB,
  qa_pairs JSONB,
  notification_email TEXT,
  notification_sms TEXT,
  custom_greeting TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bc.customer_id,
    bc.business_name,
    bc.industry,
    bc.business_hours,
    bc.services,
    bc.qa_pairs,
    bc.notification_email,
    bc.notification_sms,
    bc.custom_greeting
  FROM public.business_configs bc
  WHERE bc.twilio_number = phone_number
    AND bc.status = 'live';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
