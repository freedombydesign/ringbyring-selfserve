'use client';

import { useState } from 'react';
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
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    completedSteps: [],
    data: {},
  });

  const currentStepInfo = STEPS.find((s) => s.id === state.currentStep);

  const updateData = (newData: Partial<BusinessConfig>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...newData },
    }));
  };

  const nextStep = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, STEPS.length),
      completedSteps: [...new Set([...prev.completedSteps, prev.currentStep])],
    }));
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

  const handleComplete = () => {
    router.push('/dashboard');
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <BusinessBasicsStep
            data={state.data}
            onUpdate={updateData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <BusinessHoursStep
            data={state.data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <ServicesStep
            data={state.data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <NotificationsStep
            data={state.data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <ForwardingStep
            data={state.data}
            onUpdate={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <TestCallStep
            data={state.data}
            onComplete={handleComplete}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

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
