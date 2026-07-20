'use client';

import { useState } from 'react';
import { Phone, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import type { BusinessConfig } from '@/types';

interface TestCallStepProps {
  data: Partial<BusinessConfig>;
  onComplete: () => void;
  onBack: () => void;
}

type TestStatus = 'idle' | 'calling' | 'success' | 'failed';

export function TestCallStep({
  data,
  onComplete,
  onBack,
}: TestCallStepProps) {
  const [status, setStatus] = useState<TestStatus>('idle');

  const handleTestCall = async () => {
    setStatus('calling');

    // Simulate test call - in real implementation, this calls the API
    // which triggers a call to the customer's forwarded line
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // For demo, randomly succeed/fail
    setStatus('success');
  };

  const handleRetry = () => {
    setStatus('idle');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Test your setup
        </h2>
        <p className="text-sm text-gray-500">
          Let&apos;s make sure Sarah answers your calls correctly.
        </p>
      </div>

      {/* Config Summary */}
      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Your Setup</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Business:</div>
          <div className="text-gray-900">{data.business_name || 'Not set'}</div>

          <div className="text-gray-500">Industry:</div>
          <div className="text-gray-900 capitalize">{data.industry || 'Not set'}</div>

          <div className="text-gray-500">Notifications:</div>
          <div className="text-gray-900">{data.notification_email || 'Not set'}</div>
        </div>
      </div>

      {/* Test Call Area */}
      <div className="text-center py-8">
        {status === 'idle' && (
          <>
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to test?
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Click below to receive a test call. Sarah will answer and greet you
              as &ldquo;{data.business_name || 'your business'}&rdquo;.
            </p>
            <button
              onClick={handleTestCall}
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg
                hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
            >
              <Phone className="h-5 w-5" />
              Call Me to Test
            </button>
          </>
        )}

        {status === 'calling' && (
          <>
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Calling you now...
            </h3>
            <p className="text-sm text-gray-500">
              Your phone should ring any moment. Answer to hear Sarah!
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sarah is ready!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Everything looks good. Click below to go live.
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Call didn&apos;t connect
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Make sure your forwarding is set up correctly and try again.
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium
                rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </>
        )}
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
          onClick={onComplete}
          disabled={status !== 'success'}
          className={`
            flex-1 px-4 py-2 font-medium rounded-lg transition-colors
            ${status === 'success'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Go Live
        </button>
      </div>

      {/* Skip option */}
      {status === 'idle' && (
        <p className="text-center text-xs text-gray-500">
          <button
            onClick={onComplete}
            className="underline hover:text-gray-700"
          >
            Skip test and go live anyway
          </button>
        </p>
      )}
    </div>
  );
}
