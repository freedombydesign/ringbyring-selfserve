'use client';

import { useState } from 'react';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { CARRIER_INSTRUCTIONS } from '@/lib/carrier-instructions';
import type { BusinessConfig } from '@/types';

interface ForwardingStepProps {
  data: Partial<BusinessConfig>;
  twilioNumber: string | null;
  onUpdate: (data: Partial<BusinessConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

type Carrier = 'verizon' | 'att' | 'tmobile' | 'other';

export function ForwardingStep({
  data,
  twilioNumber,
  onUpdate,
  onNext,
  onBack,
}: ForwardingStepProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier>('verizon');
  const [confirmed, setConfirmed] = useState(false);

  // Use the provisioned Twilio number
  const ringByRingNumber = twilioNumber || data.twilio_number || 'Loading...';

  const instructions = CARRIER_INSTRUCTIONS[selectedCarrier];

  const handleContinue = () => {
    if (!confirmed) return;
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Connect your phone to RingByRing
        </h2>
        <p className="text-sm text-gray-500">
          Set up call forwarding so RingByRing answers when you can&apos;t.
        </p>
      </div>

      {/* RingByRing's Number */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-full">
            <Phone className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-emerald-800 font-medium">
              Your RingByRing Number
            </p>
            <p className="text-lg font-mono text-emerald-900">
              {ringByRingNumber}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-emerald-700">
          Forward your business calls to this number.
        </p>
      </div>

      {/* Carrier Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select your phone carrier
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['verizon', 'att', 'tmobile', 'other'] as Carrier[]).map((carrier) => (
            <button
              key={carrier}
              type="button"
              onClick={() => setSelectedCarrier(carrier)}
              className={`
                px-4 py-2 border rounded-lg text-sm font-medium transition-colors
                ${selectedCarrier === carrier
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {CARRIER_INSTRUCTIONS[carrier].carrier}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">
          How to set up forwarding for {instructions.carrier}
        </h3>
        <ol className="space-y-2">
          {instructions.instructions.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="font-medium text-gray-500">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>

        {instructions.no_answer_code && (
          <div className="mt-4 p-3 bg-white border rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Quick code to dial:</p>
            <p className="font-mono text-lg text-gray-900">
              {instructions.no_answer_code}
              {ringByRingNumber.replace(/\D/g, '')}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation */}
      <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 text-gray-900 text-emerald-600 rounded focus:ring-emerald-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-900">
            I&apos;ve set up call forwarding
          </span>
          <p className="text-xs text-gray-500">
            If you&apos;re not sure, continue anyway — you can test on the next step.
          </p>
        </div>
      </label>

      {/* Warning if not confirmed */}
      {!confirmed && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Make sure to set up forwarding or RingByRing won&apos;t receive your calls.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium
            rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!confirmed}
          className={`
            flex-1 px-4 py-2 font-medium rounded-lg transition-colors
            ${confirmed
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Continue to Test
        </button>
      </div>
    </div>
  );
}
