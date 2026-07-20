'use client';

import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export function ProgressBar({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: ProgressBarProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isClickable = isCompleted || isCurrent;

          return (
            <li
              key={step.id}
              className={`relative ${index !== steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    relative flex h-8 w-8 items-center justify-center rounded-full
                    text-sm font-medium transition-colors
                    ${isCompleted
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : isCurrent
                        ? 'border-2 border-emerald-600 bg-white text-emerald-600'
                        : 'border-2 border-gray-300 bg-white text-gray-400'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </button>

                {/* Connector line */}
                {index !== steps.length - 1 && (
                  <div
                    className={`
                      h-0.5 flex-1 mx-2
                      ${completedSteps.includes(step.id) ? 'bg-emerald-600' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>

              {/* Step label (show on larger screens) */}
              <span
                className={`
                  absolute -bottom-6 left-0 text-xs font-medium
                  hidden sm:block whitespace-nowrap
                  ${isCurrent ? 'text-emerald-600' : 'text-gray-500'}
                `}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
