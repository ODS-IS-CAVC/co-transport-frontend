import { cn } from '@/lib/utils';

import { Logo } from '../layout/Logo';

interface HeaderAuthProps {
  title?: string;
  className?: string;
}

function HeaderAuth({ title = '共同輸送システム', className }: HeaderAuthProps) {
  return (
    <div className={cn('flex items-center justify-center w-full', className)}>
      <Logo height={55} width={55} />
      <p className='text-[#757575] text-h1 font-normal leading-[3.15rem] ml-4'>{title}</p>
    </div>
  );
}

export default HeaderAuth;
