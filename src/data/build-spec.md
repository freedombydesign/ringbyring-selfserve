# RingByRing — Self-Serve Onboarding Build Spec

**Purpose:** Turn RingByRing from a done-for-you ($1,500–$2,500 manual setup) into a true self-serve SaaS where a stranger can buy, configure, and go live **without Ruth touching anything**. This spec is written to be handed to Claude Code.

**The one job of this build:** Close the gap between "customer clicks Buy" and "RingByRing is answering their phone" with zero human involvement. Everything below serves that single outcome. If a feature doesn't move someone closer to a live, answering RingByRing, cut it from round one.

---

## 1. What already exists (do not rebuild)

- **Twilio phone-line infrastructure — STABLE, production-ready.** A real Twilio number receives a call, RingByRing answers, conversation runs on the AI brain (Gemini Flash). This works today.
- **The AI brain / call handling logic.** RingByRing can take a call, understand context, and respond.
- **Per-call context passing.** Demo system already passes company context via query params so RingByRing knows who's calling before the call connects. This proves the architecture for injecting per-customer config into a call.
- **Landing page** at www.ringbyring.com.

**What this build adds:** the self-serve layer *on top of* the stable phone infrastructure — signup, payment, configuration capture, automated provisioning, and a customer dashboard. **None of the existing call infrastructure should be rewritten.** This is a wrapper, not a rebuild.

---

## 2. What GHL does — what to mirror, what to skip

GHL's onboarding is the reference, but most of it is agency-grade overhead that is the *enemy* of self-serve. Mirror the data they collect; skip the manual scaffolding.

**Mirror (the necessary config RingByRing needs to answer well):**
- Business name, business phone number (the number to cover), business type/industry
- Business hours (so RingByRing knows when to answer — after-hours / overflow / weekend coverage)
- Services offered + key Q&A pairs (this is RingByRing's knowledge base — what it says when asked about pricing, services, location)
- Where to send the message/lead after a call (notification email + SMS)
- How calls reach RingByRing (call-forwarding setup — see §4)

**Skip / defer (GHL overhead that kills self-serve):**
- Sub-account architecture — not needed for single-business customers
- A2P 10DLC registration — **flag for legal/compliance review** (see §7); do not silently skip if SMS lead delivery is in scope
- Google/Facebook publisher connections, Listings, social URLs — irrelevant to a receptionist
- Pre-built "snapshots," pipelines, CRM stages — out of scope round one
- Live walkthrough call — the entire point is to eliminate this

**The insight:** GHL collects roughly the right *information*, but delivers it through a high-touch agency process. Your edge is delivering the same outcome through a 5-minute self-serve form + automated provisioning.

---

## 3. The self-serve flow (the spec's core)

Six steps, start to live. Target: under 10 minutes, no human.

**Step 1 — Buy.** Stripe checkout on the landing page. Setup fee (one-time) + monthly subscription. Checkout success fires a webhook that creates the customer record and triggers provisioning. (Pricing structure left to Ruth — see §6 open questions.)

**Step 2 — Account creation.** On checkout success, auto-create a login (magic link or email+password). Customer lands in the onboarding wizard immediately — no "we'll be in touch."

**Step 3 — Configuration wizard.** The form that captures everything in §2 "Mirror." Built as a short multi-step wizard (progress bar, can save and resume). Each field maps directly to a variable RingByRing uses on a call:
- Business name → how RingByRing greets
- Hours → when RingByRing answers
- Services + Q&A → what RingByRing knows
- Notification destination → where the captured lead/message goes
This wizard is the heart of self-serve. It replaces Ruth's manual setup entirely.

**Step 4 — Automated provisioning.** On wizard completion, the system **programmatically**:
- Provisions a Twilio number (or assigns from a pool) via Twilio API — no manual purchase
- Writes the customer's config to the per-customer context store the call brain already reads from
- Associates the number with that customer's config so an inbound call loads the right business context (mirrors the existing query-param context architecture, but keyed to a stored customer record instead of a URL param)

**Step 5 — Connect the phone (the one step the customer must do).** RingByRing only works if calls actually reach it. The customer forwards their existing business number to the provisioned Twilio number. The wizard must show **carrier-specific conditional-forwarding instructions** (no-answer / busy / after-hours forwarding). For reference, the standard codes are `*94` to set no-answer forwarding and `*90` for busy on many carriers, but **the spec should include a lookup or a clean set of instructions per major carrier** (and a "call your carrier and ask for conditional call forwarding" fallback). This is the single biggest drop-off risk in the whole flow — make it idiot-proof, with a test-call button at the end.

**Step 6 — Test & go live.** A "Call to test RingByRing" button that rings the customer's forwarded line so they hear RingByRing answer with their config. Once confirmed, status flips to Live. Done.

---

## 4. Call routing architecture

The existing demo passes context per-call via query params. Self-serve needs the same context injection, but **keyed to a stored customer + their provisioned number** rather than a URL.

- Each customer → one provisioned Twilio number → one config record.
- Inbound call to that number → system looks up the config by the dialed number → loads business name, hours, services, Q&A into the call brain → RingByRing answers in-character for that business.
- This is the same mechanism as the demo, persisted. **Do not invent a new architecture; persist the existing one.**

---

## 5. Customer dashboard (minimum viable)

After go-live, the customer needs a place to:
- See call logs / captured messages (what RingByRing took down while they were unavailable)
- Edit their config (hours, services, Q&A) — re-runs the same wizard
- See/manage billing (Stripe customer portal — don't build billing UI, embed Stripe's)
- Re-test RingByRing

Keep it minimal. Call log + edit config + Stripe portal link. Nothing more in round one.

---

## 6. Open questions for Ruth (decide before build)

1. **Pricing structure for self-serve.** DFY was $1,500–$2,500 setup. Self-serve almost certainly needs a *lower* setup fee (or none) + monthly, because there's no manual labor to recoup and a high one-time fee kills cold-traffic conversion. What's the setup fee and monthly for the self-serve tier? (This also has to leave margin above Twilio + AI per-call costs — the original all-inclusive model had a noted margin problem.)
2. **Twilio number: provision-per-customer or pool?** Per-customer is cleaner; confirm cost tolerance.
3. **Industry focus for launch.** The programmatic SEO play (see companion note) wants a defined trade×city target set. Which verticals first?
4. **SMS lead delivery in scope for v1?** If yes, A2P compliance must be handled. If email-only delivery for v1, you sidestep A2P and ship faster. **Recommend email-only for v1** to avoid the compliance gate blocking launch.

---

## 7. Compliance flags (do not skip)

- **A2P 10DLC:** if RingByRing sends SMS (lead notifications, or texting callers back), US carrier registration is required. Defer by making v1 email-notification-only. Flag clearly to the customer if/when SMS is added.
- **Call recording consent:** if calls are recorded/transcribed, two-party-consent states require disclosure. RingByRing should have a consent line in the greeting where required, or recording disabled where not handled. Confirm before launch.
- **Telecom/number provisioning terms:** automated Twilio number provisioning at scale has Twilio ToS and regulatory bundle requirements (esp. for certain countries). Verify Twilio account is configured for programmatic provisioning before relying on it.

---

## 8. Build order (ship live fastest)

1. Stripe checkout → webhook → customer record + login. (Proves money in.)
2. Config wizard (the form). (Proves config capture.)
3. Programmatic Twilio provisioning + config-keyed call routing. (Proves automated go-live — the hard part.)
4. Forwarding-instructions step + test-call button. (Proves the customer can actually connect.)
5. Minimal dashboard (call log + edit + Stripe portal).
6. Polish, then point traffic at it.

**Definition of done:** Ruth can send a stranger to the landing page, walk away, and that stranger ends up with RingByRing answering their forwarded phone — Ruth never opens her laptop.

---

## 9. Stack note

Use Ruth's existing stack: Next.js, TypeScript, React, Supabase/Postgres (customer + config records), Vercel, Stripe, Twilio, Gemini for the call brain. No new infrastructure dependencies — this rides on what's already proven.
