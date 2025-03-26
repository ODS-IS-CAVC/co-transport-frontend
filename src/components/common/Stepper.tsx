import clsx from 'clsx';
import React, { FC } from 'react';

interface StepperProps {
  steps: {
    label: string;
    content?: React.ReactNode;
  }[];
  activeStep: string | undefined;
  classNames?: string;
}

const Stepper: FC<StepperProps> = ({ steps = [], activeStep, classNames }) => {
  const activeContent = steps.find(
    (_step: { label: string; content?: React.ReactNode }) => _step.label === activeStep,
  )?.content;

  const activeIndex = steps.findIndex((step) => step.label === activeStep);
  const previousSteps = steps.slice(0, activeIndex + 1).map((step) => step.label);
  return (
    <div className='mx-auto'>
      <div className={clsx(`flex relative justify-between items-center`, classNames)}>
        {steps.map((step, index) => (
          <div key={index} className='relative'>
            {/* Step Number & Label */}
            <div className='z-10 flex flex-col items-center'>
              <p className={clsx('text-h3 text-center', step.label === activeStep && 'text-primary')}>{index + 1}</p>
              <p className={clsx('my-3 text-base text-center', step.label === activeStep && 'text-primary')}>
                {step.label}
              </p>
              <span
                className={clsx(
                  'h-9 w-9 z-10 flex rounded-full border-4 border-primary text-primary',
                  previousSteps.includes(step.label) ? 'bg-primary' : 'bg-background',
                )}
              />
            </div>
          </div>
        ))}
        {/* Progress Bar */}
        {/* {index < steps.length - 1 && ( */}
        <div className='absolute z-9 bottom-4 w-[98%] transform'>
          <div className='h-1 bg-primary' />
        </div>
        {/* )} */}
      </div>

      {/* Content */}
      <div className='!mt-8'>{activeContent}</div>
    </div>
  );
};

export default Stepper;
