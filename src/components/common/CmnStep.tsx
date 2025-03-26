import { FC } from 'react';

import { cn } from '@/lib/utils';

interface CmnStepProps {
  steps: {
    id: number;
    text: string;
    content?: any;
  }[];
  activeStep: number;
  handleClick: (stepId: number) => void;
  className?: string;
  svgClass?: string;
  isLoading?: boolean;
}
export const CmnStep: FC<CmnStepProps> = ({ steps, activeStep, handleClick, className, svgClass, isLoading }) => {
  if (isLoading) {
    return <></>;
  }

  const activeContent = steps.find((step) => step.id === activeStep)?.content;

  return (
    <>
      <div className='flex flex-row w-full'>
        {steps.map((step, index) => (
          <a
            key={step.id}
            className={cn(
              'flex-1 relative cursor-pointer',
              steps.length < 4 ? 'max-w-[26%]' : 'max-w-[30%]',
              index !== 0 ? 'ml-[-1.85rem]' : '',
              activeStep === step.id ? 'text-blue-900' : 'text-white',
              className,
            )}
            onClick={() => handleClick(step.id)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className={cn('w-full h-auto', svgClass)}
              viewBox='0 0 229 30'
              fill='none'
            >
              <path
                d={
                  index === 0
                    ? 'M0.5 15C0.5 6.99187 6.99187 0.5 15 0.5H207.809L227.328 15L207.809 29.5H15C6.99186 29.5 0.5 23.0081 0.5 15Z'
                    : index === steps.length - 1
                      ? 'M1.53715 0.5H193C201.008 0.5 207.5 6.99187 207.5 15C207.5 23.0081 201.008 29.5 193 29.5H1.53714L20.5155 15.4014L21.0558 15L20.5155 14.5986L1.53715 0.5Z'
                      : 'M208.337 29.5H2.03959L21.0179 15.4014L21.5582 15L21.0179 14.5986L2.03959 0.5H208.337L227.856 15L208.337 29.5Z'
                }
                fill={activeStep === step.id ? '#0017C1' : 'white'}
                stroke={'#00118F'}
              />
            </svg>
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center text-sm',
                activeStep === step.id ? 'text-white' : 'text-tertiary',
              )}
            >
              {step.text}
            </span>
          </a>
        ))}
      </div>

      {activeContent && <div className='!mt-8'>{activeContent}</div>}
    </>
  );
};
