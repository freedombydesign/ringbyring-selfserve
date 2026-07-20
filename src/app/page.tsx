'use client';

import { useState } from 'react';
import { Phone, Clock, DollarSign, Zap, CheckCircle, ArrowRight, Play, MessageSquare, Calendar, PhoneForwarded, X, Loader2 } from 'lucide-react';
import { OrganizationSchema, ServiceSchema, WebSiteSchema, FAQSchema } from '@/components/seo';

const DEMO_PHONE = '+13479192658';
const DEMO_PHONE_DISPLAY = '(347) 919-2658';

// Homepage FAQs for schema markup
const homepageFAQs = [
  { q: "Does it really sound human?", a: "Yes — RingByRing uses the latest AI voice technology with sub-second response times. Callers regularly don't realize they're talking to AI." },
  { q: "How do I connect it to my phone?", a: "You forward your existing business line to your RingByRing number. You can forward all calls, or just calls when you're busy/after-hours. Works with any carrier." },
  { q: "Can it actually book appointments?", a: "Yes. RingByRing connects to Google Calendar and other scheduling tools. It checks your availability and books jobs directly, then texts you the confirmation." },
  { q: "What if the caller has a complex question?", a: "RingByRing handles most questions using the information you provide during setup. For anything outside its scope, it takes a message and notifies you immediately." },
  { q: "Is there a contract?", a: "No contracts, no commitments. Pay month-to-month and cancel anytime. We also offer a 7-day money-back guarantee if you're not satisfied." },
  { q: "What's included in the $149/month?", a: "Everything: unlimited calls, 24/7 coverage, appointment booking, bilingual support, call recordings, transcripts, and notifications. No hidden fees." },
];

export default function Home() {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDemoCall = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'demo_call_click', { location: 'hero' });
    }
    window.location.href = `tel:${DEMO_PHONE}`;
  };

  const handleGetStarted = () => {
    setShowCheckoutModal(true);
    setError('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      // Track conversion
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'begin_checkout', { email });
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Schema Markup for SEO */}
      <OrganizationSchema />
      <ServiceSchema />
      <WebSiteSchema />
      <FAQSchema faqs={homepageFAQs} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RingByRing</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
                Pricing
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium hidden sm:block">
                How It Works
              </a>
              <button
                onClick={handleDemoCall}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">Hear Demo</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-powered • Answers in under 1 second
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Stop Missing Calls.<br />
            <span className="text-emerald-600">Start Booking Jobs.</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            RingByRing answers your phone 24/7 with AI that sounds human.
            Book appointments, answer questions, and never lose another customer to voicemail.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleDemoCall}
              className="inline-flex items-center justify-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <Phone className="w-5 h-5" />
              Call Now to Hear It Live
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Play className="w-5 h-5" />
              See How It Works
            </a>
          </div>

          <p className="text-gray-500">
            Call <span className="font-semibold text-gray-700">{DEMO_PHONE_DISPLAY}</span> right now —
            RingByRing will answer as a sample plumbing company
          </p>
        </div>
      </section>

      {/* Pain Point Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">85%</div>
              <p className="text-gray-300">of callers who hit voicemail never call back</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">62%</div>
              <p className="text-gray-300">will call a competitor instead</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">$900+</div>
              <p className="text-gray-300">lost monthly from just 10 missed calls</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Live in 15 Minutes. No Tech Skills Required.
            </h2>
            <p className="text-xl text-gray-600">
              Set up RingByRing yourself — no calls with sales reps, no waiting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-sm font-semibold text-emerald-600 mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tell Us About Your Business</h3>
              <p className="text-gray-600">
                Answer a few questions about your services, hours, and how you want calls handled.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PhoneForwarded className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-sm font-semibold text-emerald-600 mb-2">Step 2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Forward Your Calls</h3>
              <p className="text-gray-600">
                We give you a number. Forward your business line when you can't answer — or 24/7.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-sm font-semibold text-emerald-600 mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Start Booking Jobs</h3>
              <p className="text-gray-600">
                RingByRing answers, qualifies leads, books appointments, and texts you the details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Never Miss a Call
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: '24/7 Availability', desc: 'Nights, weekends, holidays — always answered' },
              { icon: Zap, title: 'Sub-Second Response', desc: 'No awkward pauses or robotic delays' },
              { icon: MessageSquare, title: 'Natural Conversation', desc: 'Handles follow-ups, interruptions, and real questions' },
              { icon: Calendar, title: 'Books Appointments', desc: 'Integrates with your calendar to schedule jobs' },
              { icon: Phone, title: 'Bilingual Support', desc: 'English and Spanish at no extra cost' },
              { icon: CheckCircle, title: 'Instant Notifications', desc: 'Get texts/emails immediately after every call' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <feature.icon className="w-8 h-8 text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Flat-Rate Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No per-minute fees. No surprise bills. No contracts.
            </p>
          </div>

          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-8 sm:p-12 shadow-xl shadow-emerald-500/10">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-sm font-medium mb-6">
                Most Popular
              </div>

              <div className="mb-6">
                <span className="text-5xl sm:text-6xl font-bold text-gray-900">$149</span>
                <span className="text-xl text-gray-500">/month</span>
              </div>

              <ul className="space-y-4 text-left max-w-sm mx-auto mb-8">
                {[
                  'Unlimited calls — no per-minute charges',
                  '24/7 coverage including holidays',
                  'Appointment booking & calendar sync',
                  'Instant text/email notifications',
                  'Bilingual (English + Spanish)',
                  'Call recordings & transcripts',
                  '$0 setup fee',
                  'Cancel anytime',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-colors"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-gray-500 text-sm mt-4">
                7-day money-back guarantee • No credit card required to try demo
              </p>
            </div>
          </div>

          {/* Comparison */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Compare to alternatives:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-gray-100 px-4 py-2 rounded-full">
                <span className="line-through text-gray-400">Ruby: $250+/mo</span>
              </span>
              <span className="bg-gray-100 px-4 py-2 rounded-full">
                <span className="line-through text-gray-400">Part-time hire: $1,500+/mo</span>
              </span>
              <span className="bg-gray-100 px-4 py-2 rounded-full">
                <span className="line-through text-gray-400">Smith.ai: $4+/call</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for Service Businesses
            </h2>
            <p className="text-xl text-gray-400">
              RingByRing knows your industry — answers questions, quotes services, books jobs.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Plumbers', 'Electricians', 'HVAC', 'Roofers', 'Landscapers',
              'Cleaners', 'Painters', 'Contractors', 'Auto Repair', 'Dental', 'Legal'
            ].map((industry) => (
              <span key={industry} className="bg-gray-800 px-5 py-2 rounded-full text-gray-300 hover:bg-gray-700 transition-colors">
                {industry}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "Does it really sound human?",
                a: "Yes — RingByRing uses the latest AI voice technology with sub-second response times. Callers regularly don't realize they're talking to AI. Call our demo line right now to hear it yourself."
              },
              {
                q: "How do I connect it to my phone?",
                a: "You forward your existing business line to your RingByRing number. You can forward all calls, or just calls when you're busy/after-hours. Works with any carrier — we provide step-by-step instructions."
              },
              {
                q: "Can it actually book appointments?",
                a: "Yes. RingByRing connects to Google Calendar and other scheduling tools. It checks your availability and books jobs directly, then texts you the confirmation."
              },
              {
                q: "What if the caller has a complex question?",
                a: "RingByRing handles most questions using the information you provide during setup. For anything outside its scope, it takes a message and notifies you immediately so you can call back."
              },
              {
                q: "Is there a contract?",
                a: "No contracts, no commitments. Pay month-to-month and cancel anytime. We also offer a 7-day money-back guarantee if you're not satisfied."
              },
              {
                q: "What's included in the $149/month?",
                a: "Everything: unlimited calls, 24/7 coverage, appointment booking, bilingual support, call recordings, transcripts, and notifications. No hidden fees, no per-minute charges, no setup costs."
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Stop Missing Calls?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Try RingByRing risk-free. Set up in 15 minutes, cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started — $149/mo
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleDemoCall}
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Hear Demo First
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-gray-400">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RingByRing</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="mailto:support@ringbyring.com" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} RingByRing. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Started with RingByRing</h3>
              <p className="text-gray-600">Enter your email to begin checkout</p>
            </div>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    Continue to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              $149/month • Cancel anytime • 7-day money-back guarantee
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
