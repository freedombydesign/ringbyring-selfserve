'use client';

import { Phone, Play } from 'lucide-react';
import type { Trade, City } from '@/types';

interface DemoCTAProps {
  trade: Trade;
  city: City;
  variant?: 'primary' | 'dark' | 'outline';
}

// Demo phone number - this would be configured per deployment
// In production, this calls RingByRing and the prospect hears the AI answer
const DEMO_PHONE_NUMBER = '+18005551234'; // Replace with actual demo line

export function DemoCTA({ trade, city, variant = 'primary' }: DemoCTAProps) {
  const handleDemoCall = () => {
    // Track the click for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'demo_call_click', {
        trade: trade.slug,
        city: city.slug,
      });
    }

    // On mobile, initiate the call
    // On desktop, show the number or open a modal
    window.location.href = `tel:${DEMO_PHONE_NUMBER}`;
  };

  const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all";

  const variantClasses = {
    primary: "bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg hover:shadow-xl",
    dark: "bg-emerald-500 text-white hover:bg-emerald-400",
    outline: "border-2 border-white text-white hover:bg-white/10",
  };

  return (
    <button
      onClick={handleDemoCall}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <Phone className="h-5 w-5" />
      <span>Hear a Demo Call</span>
    </button>
  );
}

// Alternative: Embedded audio player for hearing the demo without calling
export function DemoAudioPlayer({ trade }: { trade: Trade }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <button className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center hover:bg-emerald-400 transition-colors">
          <Play className="h-6 w-6 text-white ml-1" />
        </button>
        <div className="flex-1">
          <p className="text-white font-medium">Sample greeting for {trade.display_plural}</p>
          <p className="text-gray-400 text-sm">0:15</p>
        </div>
      </div>
      {/* Audio waveform visualization placeholder */}
      <div className="mt-3 h-8 bg-gray-700 rounded flex items-center px-2 gap-0.5">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-emerald-500 rounded-full"
            style={{ height: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
