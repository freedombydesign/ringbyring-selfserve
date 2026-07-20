'use client';

import { Phone, CheckCircle, Clock, DollarSign, MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Trade, City } from '@/types';
import { DemoCTA } from './DemoCTA';

interface TradeCityPageProps {
  trade: Trade;
  city: City;
}

export function TradeCityPage({ trade, city }: TradeCityPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-emerald-200 text-sm mb-6">
            <span>RingByRing</span>
            <span>/</span>
            <span className="capitalize">{trade.display_plural}</span>
            <span>/</span>
            <span>{city.display_name}</span>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
            AI Receptionist for {trade.display_plural} in {city.display_name}
          </h1>

          {/* Pain headline */}
          <p className="text-xl sm:text-2xl text-emerald-100 mb-8 max-w-2xl">
            {trade.pain_headline}
          </p>

          {/* Quick value props */}
          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Clock className="h-4 w-4" />
              <span className="text-sm">24/7 coverage</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">$149/mo flat</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">No setup fee</span>
            </div>
          </div>

          {/* Demo CTA */}
          <DemoCTA trade={trade} city={city} />
        </div>
      </section>

      {/* Pain Body Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            The problem every {trade.display_name.toLowerCase()} knows
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {trade.pain_body}
          </p>
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-lg">
            <p className="text-emerald-900 font-medium text-lg">
              {trade.roi_line}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-12 text-center">
            How RingByRing works for {trade.display_plural} in {city.display_name}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-700 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sign up in 15 minutes</h3>
              <p className="text-gray-600 text-sm">
                Tell us about your business, services, and how you want calls handled. No tech skills needed.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-700 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Forward your calls</h3>
              <p className="text-gray-600 text-sm">
                Set up call forwarding from your business line. We give you the exact codes to dial.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-700 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Never miss a lead</h3>
              <p className="text-gray-600 text-sm">
                RingByRing answers, captures caller details, and sends you the lead instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Greeting */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Hear how RingByRing answers for {trade.display_plural}
          </h2>
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-gray-300 text-sm mb-2">Sample greeting:</p>
            <p className="text-xl text-emerald-400 italic">
              &ldquo;{trade.demo_greeting}&rdquo;
            </p>
          </div>
          <DemoCTA trade={trade} city={city} variant="dark" />
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Questions {trade.display_plural} ask about RingByRing
          </h2>

          <div className="space-y-4">
            {trade.faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} />
            ))}

            {/* Common FAQs for all trades */}
            <FAQItem
              question="How much does RingByRing cost?"
              answer="$149/month flat rate, unlimited calls. No per-minute charges, no overage fees, no setup cost. Cancel anytime."
            />
            <FAQItem
              question="How fast can I get set up?"
              answer="Most businesses are live in 15 minutes. Sign up, tell us about your business, forward your number, and you're done."
            />
            <FAQItem
              question="Does this replace my existing phone service?"
              answer="No. You keep your current business number. You just forward calls to RingByRing when you can't answer — after hours, when you're busy, or all the time. Your choice."
            />
          </div>
        </div>
      </section>

      {/* Local Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <MapPin className="h-5 w-5" />
            <span>Serving {city.display_name} and surrounding areas</span>
          </div>
          <p className="text-gray-500">
            Also available for {trade.display_plural} in {city.nearby.join(', ')}, and across {city.region}.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Stop losing calls. Start capturing leads.
          </h2>
          <p className="text-emerald-100 mb-8">
            {trade.roi_line}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/onboarding"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Start Free Setup
            </a>
            <DemoCTA trade={trade} city={city} variant="outline" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} RingByRing. AI receptionist for small businesses.</p>
          <p className="mt-2">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            {' · '}
            <a href="/terms" className="hover:text-white">Terms</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );
}
