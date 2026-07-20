'use client';

import type { BusinessConfig } from '@/types';

interface BusinessHoursStepProps {
  data: Partial<BusinessConfig>;
  onUpdate: (data: Partial<BusinessConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BusinessHoursStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: BusinessHoursStepProps) {
  // TODO: Implement full hours picker
  // For now, a simplified version

  const handleContinue = () => {
    onUpdate({
      coverage_mode: 'after_hours',
      business_hours: {
        timezone: 'America/New_York',
        schedule: {
          monday: { is_open: true, open_time: '09:00', close_time: '17:00' },
          tuesday: { is_open: true, open_time: '09:00', close_time: '17:00' },
          wednesday: { is_open: true, open_time: '09:00', close_time: '17:00' },
          thursday: { is_open: true, open_time: '09:00', close_time: '17:00' },
          friday: { is_open: true, open_time: '09:00', close_time: '17:00' },
          saturday: { is_open: false, open_time: null, close_time: null },
          sunday: { is_open: false, open_time: null, close_time: null },
        },
      },
    });
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          When should Sarah answer?
        </h2>
        <p className="text-sm text-gray-500">
          Set your business hours so Sarah knows when to take over.
        </p>
      </div>

      {/* Coverage Mode */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Coverage Mode
        </label>

        <div className="space-y-2">
          {[
            { value: 'after_hours', label: 'After Hours Only', desc: 'Sarah answers when you\'re closed' },
            { value: 'overflow', label: 'Overflow', desc: 'Sarah answers if you don\'t pick up' },
            { value: 'always', label: 'Always On', desc: 'Sarah answers all calls 24/7' },
          ].map((mode) => (
            <label
              key={mode.value}
              className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="coverage_mode"
                value={mode.value}
                defaultChecked={mode.value === (data.coverage_mode || 'after_hours')}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  {mode.label}
                </span>
                <span className="block text-xs text-gray-500">
                  {mode.desc}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Hours (placeholder for full implementation) */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Default hours:</strong> Monday–Friday, 9 AM – 5 PM (Eastern)
        </p>
        <p className="text-xs text-gray-500 mt-1">
          You can customize this in your dashboard after setup.
        </p>
      </div>

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
          className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg
            hover:bg-emerald-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
