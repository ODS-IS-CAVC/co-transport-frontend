import { cn } from '@/lib/utils';

interface IconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const Icon = (props: IconProps) => {
  const { icon, size = 24, className } = props;
  return (
    <span
      className={cn('material-symbols-outlined', className)}
      style={{
        fontSize: size,
      }}
    >
      {icon}
    </span>
  );
};
