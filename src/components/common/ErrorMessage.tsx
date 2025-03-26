import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  errorMessage?: string;
  className?: string;
}

function ErrorMessage({ errorMessage, className }: ErrorMessageProps) {
  return (
    <>
      {errorMessage && (
        <p className={cn('text-error text-xs font-normal leading-[1.313rem]', className)}>{errorMessage}</p>
      )}
    </>
  );
}

export default ErrorMessage;
