'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessBasicsStep } from '@/components/onboarding/BusinessBasicsStep';
import { BusinessHoursStep } from '@/components/onboarding/BusinessHoursStep';
import { ServicesStep } from '@/components/onboarding/ServicesStep';
import { NotificationsStep } from '@/components/onboarding/NotificationsStep';
import { ForwardingStep } from '@/components/onboarding/ForwardingStep';
import { TestCallStep } from '@/components/onboarding/TestCallStep';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import type { OnboardingState, BusinessConfig } from '@/types';

const STEPS = [
  { id: 1, title: 'Business Basics', description: 'Tell us about your business' },
  { id: 2, title: 'Business Hours', description: 'When should we answer?' },
  { id: 3, title: 'Services & FAQ', description: "What we need to know" },
  { id: 4, title: 'Notifications', description: 'Where to send leads' },
  { id: 5, title: 'Connect Phone', description: 'Forward calls to RingByRing' },
  { id: 6, title: 'Test & Go Live', description: 'Verify everything works' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [twilioNumber, setTwilioNumber] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    completedSteps: [],
    data: {},
  });

  // Load existing progress on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch('/api/onboarding/progress');
        const data = await res.json();

        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (data.progress && data.config) {
          // Restore state from saved progress
          const completedSteps = data.progress.completed_steps || [];
          const currentStep = data.progress.current_step || 1;

          setState({
            currentStep,
            completedSteps,
            data: {
              business_name: data.config.business_name,
              business_phone: data.config.business_phone,
              industry: data.config.industry,
              business_hours: data.config.business_hours,
              coverage_mode: data.config.coverage_mode,
              services: data.config.services,
              qa_pairs: data.config.qa_pairs,
              notification_email: data.config.notification_email,
              notification_sms: data.config.notification_sms,
              custom_greeting: data.config.custom_greeting,
            },
          });

          // If they already have a Twilio number, save it
          if (data.config.twilio_number) {
            setTwilioNumber(data.config.twilio_number);
          }

          // If already live, redirect to dashboard
          if (data.config.status === 'live') {
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProgress();
  }, [router]);

  const currentStepInfo = STEPS.find((s) => s.id === state.currentStep);

  const updateData = (newData: Partial<BusinessConfig>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...newData },
    }));
  };

  // Save step and move to next
  const saveAndNext = async () => {
    setIsSaving(true);
    try {
      // Map step number to step name
      const stepNames: Record<number, string> = {
        1: 'business_basics',
        2: 'business_hours',
        3: 'services',
        4: 'notifications',
      };

      const stepName = stepNames[state.currentStep];

      if (stepName) {
        // Save current step data
        await fetch('/api/onboarding/save-step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: stepName,
            data: state.data,
          }),
        });
      }

      // After step 4, call complete to provision Twilio number
      if (state.currentStep === 4 && !twilioNumber) {
        const completeRes = await fetch('/api/onboarding/complete', {
          method: 'POST',
        });
        const completeData = await completeRes.json();

        if (completeData.config?.twilio_number) {
          setTwilioNumber(completeData.config.twilio_number);
        }
      }

      // Move to next step
      setState((prev) => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, STEPS.length),
        completedSteps: [...new Set([...prev.completedSteps, prev.currentStep])],
      }));
    } catch (error) {
      console.error('Failed to save step:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const prevStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  };

  const goToStep = (step: number) => {
    if (state.completedSteps.includes(step) || step === state.currentStep) {
      setState((prev) => ({ ...prev, currentStep: step }));
    }
  };

  const handleComplete = async () => {
    try {
      // Mark as live
      await fetch('/api/twilio/go-live', {
        method: 'POST',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to go live:', error);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <BusinessBasicsStep
            data={state.data}
            onUpdate={updateData}
            onNext={saveAndNext}
            isLoading={isSaving}
          />
        );
      case 2:
        return (
          <BusinessHoursStep
            data={state.data}
            onUpdate={updateData}
            onNext={saveAndNext}
            onBack={prevStep}
            isLoading={isSaving}
          />
        );
      case 3:
        return (
          <ServicesStep
            data={state.data}
            onUpdate={updateData}
            onNext={saveAndNext}
            onBack={prevStep}
            isLoading={isSaving}
          />
        );
      case 4:
        return (
          <NotificationsStep
            data={state.data}
            onUpdate={updateData}
            onNext={saveAndNext}
            onBack={prevStep}
            isLoading={isSaving}
          />
        );
      case 5:
        return (
          <ForwardingStep
            data={state.data}
            twilioNumber={twilioNumber}
            onUpdate={updateData}
            onNext={saveAndNext}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <TestCallStep
            data={state.data}
            twilioNumber={twilioNumber}
            onComplete={handleComplete}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Set Up RingByRing
          </h1>
          <p className="text-sm text-gray-500">
            {currentStepInfo?.description}
          </p>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProgressBar
          steps={STEPS}
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          onStepClick={goToStep}
        />
      </div>

      {/* Step Content */}
      <main className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}
