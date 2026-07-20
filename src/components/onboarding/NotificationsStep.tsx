'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BusinessConfig } from '@/types';

const schema = z.object({
  notification_email: z.string().email('Enter a valid email'),
  notification_sms: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface NotificationsStepProps {
  data: Partial<BusinessConfig>;
  onUpdate: (data: Partial<BusinessConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function NotificationsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: NotificationsStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      notification_email: data.notification_email || '',
      notification_sms: data.notification_sms || '',
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
          Where should we send leads?
        </h2>
        <p className="text-sm text-gray-500">
          After each call, RingByRing will send you the caller&apos;s info and message.
        </p>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="notification_email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notification Email
        </label>
        <input
          {...register('notification_email')}
          type="email"
          id="notification_email"
          placeholder="you@yourbusiness.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        {errors.notification_email && (
          <p className="mt-1 text-sm text-red-600">
            {errors.notification_email.message}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          You&apos;ll receive an email summary after each call.
        </p>
      </div>

      {/* SMS (optional - v1 may be email only) */}
      <div>
        <label
          htmlFor="notification_sms"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          SMS Notifications (Optional)
        </label>
        <input
          {...register('notification_sms')}
          type="tel"
          id="notification_sms"
          placeholder="(555) 123-4567"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm
            focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Get a text when RingByRing takes a message. Leave blank for email only.
        </p>
      </div>

      {/* Info box */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>What you&apos;ll receive:</strong>
        </p>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Caller&apos;s name and phone number</li>
          <li>Message or reason for calling</li>
          <li>Call duration and timestamp</li>
          <li>Link to call recording (if enabled)</li>
        </ul>
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
          type="submit"
          className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg
            hover:bg-emerald-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
