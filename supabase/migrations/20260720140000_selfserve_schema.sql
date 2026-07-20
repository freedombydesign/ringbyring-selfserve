-- ===========================================
-- RingByRing Self-Serve Database Schema
-- ===========================================
-- Tables prefixed with rbr_ to avoid conflicts
-- with existing Freedom Suite tables
-- ===========================================

-- ===========================================
-- 1. RBR_CUSTOMERS TABLE
-- Links auth.users to Stripe and tracks subscription
-- ===========================================
CREATE TABLE IF NOT EXISTS public.rbr_customers (
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
-- 2. RBR_BUSINESS_CONFIGS TABLE
-- Core configuration that RingByRing uses on calls
-- ===========================================
CREATE TABLE IF NOT EXISTS public.rbr_business_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.rbr_customers(id) ON DELETE CASCADE,

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

  -- When RingByRing answers
  coverage_mode TEXT NOT NULL DEFAULT 'after_hours' CHECK (coverage_mode IN (
    'after_hours', 'overflow', 'always', 'custom'
  )),

  -- RingByRing's knowledge base
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
-- 3. RBR_CALL_LOGS TABLE
-- Records of calls RingByRing handled
-- ===========================================
CREATE TABLE IF NOT EXISTS public.rbr_call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.rbr_customers(id) ON DELETE CASCADE,

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
-- 4. RBR_ONBOARDING_PROGRESS TABLE
-- Tracks wizard completion for resumability
-- ===========================================
CREATE TABLE IF NOT EXISTS public.rbr_onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.rbr_customers(id) ON DELETE CASCADE,

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
CREATE INDEX IF NOT EXISTS idx_rbr_customers_email ON public.rbr_customers(email);
CREATE INDEX IF NOT EXISTS idx_rbr_customers_stripe ON public.rbr_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_rbr_business_configs_customer ON public.rbr_business_configs(customer_id);
CREATE INDEX IF NOT EXISTS idx_rbr_business_configs_twilio ON public.rbr_business_configs(twilio_number);
CREATE INDEX IF NOT EXISTS idx_rbr_business_configs_status ON public.rbr_business_configs(status);
CREATE INDEX IF NOT EXISTS idx_rbr_call_logs_customer ON public.rbr_call_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_rbr_call_logs_timestamp ON public.rbr_call_logs(timestamp DESC);

-- ===========================================
-- 6. ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE public.rbr_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbr_business_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbr_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbr_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Customers can only see/edit their own data
CREATE POLICY "RBR: Users can view own customer record"
  ON public.rbr_customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "RBR: Users can update own customer record"
  ON public.rbr_customers FOR UPDATE
  USING (auth.uid() = id);

-- Business config policies
CREATE POLICY "RBR: Users can view own config"
  ON public.rbr_business_configs FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "RBR: Users can insert own config"
  ON public.rbr_business_configs FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "RBR: Users can update own config"
  ON public.rbr_business_configs FOR UPDATE
  USING (auth.uid() = customer_id);

-- Call logs policies
CREATE POLICY "RBR: Users can view own call logs"
  ON public.rbr_call_logs FOR SELECT
  USING (auth.uid() = customer_id);

-- Onboarding progress policies
CREATE POLICY "RBR: Users can view own onboarding"
  ON public.rbr_onboarding_progress FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "RBR: Users can insert own onboarding"
  ON public.rbr_onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "RBR: Users can update own onboarding"
  ON public.rbr_onboarding_progress FOR UPDATE
  USING (auth.uid() = customer_id);

-- ===========================================
-- 7. FUNCTIONS & TRIGGERS
-- ===========================================

-- Auto-update updated_at timestamp (may already exist)
CREATE OR REPLACE FUNCTION rbr_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rbr_customers_updated_at
  BEFORE UPDATE ON public.rbr_customers
  FOR EACH ROW EXECUTE FUNCTION rbr_update_updated_at();

CREATE TRIGGER rbr_business_configs_updated_at
  BEFORE UPDATE ON public.rbr_business_configs
  FOR EACH ROW EXECUTE FUNCTION rbr_update_updated_at();

CREATE TRIGGER rbr_onboarding_progress_updated_at
  BEFORE UPDATE ON public.rbr_onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION rbr_update_updated_at();

-- ===========================================
-- 8. HELPER FUNCTION: Get config by Twilio number
-- Used by the call routing to load customer context
-- ===========================================
CREATE OR REPLACE FUNCTION rbr_get_config_by_twilio_number(phone_number TEXT)
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
  FROM public.rbr_business_configs bc
  WHERE bc.twilio_number = phone_number
    AND bc.status = 'live';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
