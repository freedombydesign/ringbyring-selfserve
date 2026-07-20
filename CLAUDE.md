# RingByRing Self-Serve — Project Context

## Purpose

Transform RingByRing from a done-for-you setup ($1,500–$2,500 manual) into a **true self-serve SaaS** where a customer can buy, configure, and go live without any human involvement.

**The one job:** Close the gap between "customer clicks Buy" and "RingByRing is answering their phone" with zero human touch.

---

## Architecture

### This Project (ringbyring-selfserve)
- **Next.js 14+ App Router** — self-serve onboarding, customer dashboard, billing
- **Supabase** — auth, customer records, business config, call logs
- **Stripe** — checkout, subscriptions, billing portal
- **Twilio API** — programmatic phone number provisioning

### Existing Infrastructure (DO NOT REBUILD)
- **RingByRing Receptionist** (`/GitHub/Sarah-AI-Receptionist`)
  - Pipecat server (Python/FastAPI) handles actual voice calls
  - Gemini Live API for conversation
  - Industry prompts for context injection
  - Call recording storage
- This project is a **wrapper**, not a rebuild

---

## Self-Serve Flow (6 Steps)

1. **Buy** — Stripe checkout (setup fee + monthly subscription)
2. **Account Creation** — Auto-create login on checkout success
3. **Config Wizard** — Multi-step form capturing:
   - Business name, phone, industry
   - Business hours + coverage mode
   - Services + Q&A pairs
   - Notification destinations
4. **Automated Provisioning** — On wizard completion:
   - Provision Twilio number via API
   - Write config to database
   - Associate number with customer config
5. **Connect Phone** — Customer forwards their line to RingByRing's number
   - Carrier-specific instructions (Verizon, AT&T, T-Mobile, etc.)
6. **Test & Go Live** — Test call button, confirm RingByRing answers correctly

---

## Key Files

```
src/
├── app/
│   ├── onboarding/page.tsx      # 6-step wizard
│   ├── (auth)/                  # Login, signup
│   ├── (dashboard)/dashboard/   # Customer dashboard
│   └── api/
│       ├── webhooks/stripe/     # Stripe webhook handler
│       ├── auth/                # Auth endpoints
│       └── twilio/              # Twilio voice/provisioning
├── components/
│   └── onboarding/              # Wizard step components
├── lib/
│   ├── supabase/                # Client + server Supabase
│   ├── stripe.ts                # Stripe checkout/portal
│   └── twilio.ts                # Number provisioning
├── types/
│   └── index.ts                 # TypeScript definitions
supabase/
└── migrations/                  # Database schema
```

---

## Database Schema

- **customers** — Links auth.users to Stripe, tracks subscription
- **business_configs** — All config RingByRing uses on calls (one per customer)
- **call_logs** — Records of calls RingByRing handled
- **onboarding_progress** — Wizard state for resumability

Key function: `get_config_by_twilio_number(phone)` — Used by call routing to load customer context by dialed number.

---

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint check
```

---

## Environment Variables

See `.env.example` for all required variables:
- Supabase (URL, anon key, service role)
- Stripe (publishable, secret, webhook secret, price IDs)
- Twilio (account SID, auth token)
- App URL

---

## Build Order (Ship Fast)

1. ✅ Stripe checkout → webhook → customer record + login
2. ✅ Config wizard (form)
3. ⏳ Programmatic Twilio provisioning + config-keyed routing
4. ⏳ Forwarding instructions + test-call button
5. ⏳ Minimal dashboard (call log + edit + Stripe portal)
6. ⏳ Polish, then traffic

---

## Open Decisions

- **Pricing structure** — Setup fee amount, monthly amount
- **Twilio provisioning** — Per-customer or pool?
- **Industry focus** — Which verticals for launch?
- **SMS notifications** — v1 email-only (avoids A2P compliance) or include SMS?

---

## Compliance Notes

- **A2P 10DLC** — Required if RingByRing sends SMS. Defer by making v1 email-only.
- **Call recording consent** — Two-party states need disclosure in greeting.
- **Twilio ToS** — Verify account configured for programmatic provisioning.

---

## Definition of Done

Ruth sends a stranger to the landing page, walks away, and that stranger ends up with RingByRing answering their forwarded phone — Ruth never opens her laptop.
