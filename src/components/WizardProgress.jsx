import React from 'react';
import { Check } from 'lucide-react';

function WizardProgress({ currentStep }) {
  const steps = [
    { number: 1, title: 'Upload Script', icon: '📄' },
    { number: 2, title: 'Review Plans', icon: '🎬' },
    { number: 3, title: 'Generate', icon: '🎨' },
    { number: 4, title: 'View Results', icon: '✨' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                  step.number < currentStep
                    ? 'bg-green-500 text-white'
                    : step.number === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number < currentStep ? (
                  <Check className="w-8 h-8" />
                ) : (
                  step.icon
                )}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  step.number === currentStep
                    ? 'text-primary font-semibold'
                    : step.number < currentStep
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 relative top-[-20px]">
                <div
                  className={`h-full transition-all duration-300 ${
                    step.number < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default WizardProgress;
