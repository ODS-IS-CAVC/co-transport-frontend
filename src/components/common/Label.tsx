import { cn } from '@/lib/utils';

interface LabelProps {
  title: string;
  required?: boolean;
  name?: string;
  className?: string;
  txtRequired?: string;
}

function Label({ title, required = false, name, className, txtRequired = '*' }: LabelProps) {
  return (
    <label htmlFor={name} className={cn('font-medium text-sm leading-[1.313rem] text-foreground', className)}>
      {title}
      {required && <span className='ml-2 text-error'>{txtRequired}</span>}
    </label>
  );
}

export default Label;
