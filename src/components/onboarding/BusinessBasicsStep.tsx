'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BusinessConfig, Industry } from '@/types';

const schema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  business_phone: z.string().min(10, 'Enter a valid phone number'),
  industry: z.enum([
    'dental', 'medspa', 'chiropractor', 'trades',
    'salon', 'auto_repair', 'legal', 'real_estate', 'other'
  ] as const),
});

type FormData = z.infer<typeof schema>;

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'dental', label: 'Dental Office' },
  { value: 'medspa', label: 'Medical Spa / Aesthetics' },
  { value: 'chiropractor', label: 'Chiropractic / Wellness' },
  { value: 'trades', label: 'Home Services (HVAC, Plumbing, Electrical)' },
  { value: 'salon', label: 'Salon / Beauty' },
  { value: 'auto_repair', label: 'Auto Repair / Dealership' },
  { value: 'legal', label: 'Law Firm / Legal Services' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
];

interface BusinessBasicsStepProps {
  data: Partial<BusinessConfig>;
  onUpdate: (data: Partial<BusinessConfig>) => void;
  onNext: () => void;
}

export function BusinessBasicsStep({
  data,
  onUpdate,
  onNext,
}: BusinessBasicsStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_name: data.business_name || '',
      business_phone: data.business_phone || '',
      industry: data.industry || 'other',
    },
  });

  const onSubmit = (formData: FormData) => {
    onUpdate(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Tell Sarah about your business
        </h2>
        <p className="text-sm text-gray-500">
          This is how Sarah will greet callers and understand your industry.
        </p>
      </div>

      {/* Business Name */}
      <div>
        <label
          htmlFor="business_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Business Name
        </label>
        <input
          {...register('business_name')}
          type="text"
          id="business_name"
          placeholder="Bright Smile Dental"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {errors.business_name && (
          <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Sarah will say: &ldquo;[Business Name], this is Sarah speaking...&rdquo;
        </p>
      </div>

      {/* Business Phone */}
      <div>
        <label
          htmlFor="business_phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Business Phone Number
        </label>
        <input
          {...register('business_phone')}
          type="tel"
          id="business_phone"
          placeholder="(555) 123-4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {errors.business_phone && (
          <p className="mt-1 text-sm text-red-600">{errors.business_phone.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The number you want Sarah to cover. You&apos;ll forward this to Sarah later.
        </p>
      </div>

      {/* Industry */}
      <div>
        <label
          htmlFor="industry"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Industry
        </label>
        <select
          {...register('industry')}
          id="industry"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
        {errors.industry && (
          <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Sarah uses industry-specific language and protocols.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg
            hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500
            focus:ring-offset-2 transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
