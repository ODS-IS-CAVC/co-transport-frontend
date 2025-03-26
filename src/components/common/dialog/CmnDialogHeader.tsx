import { ModalHeader, ModalHeaderProps } from '@nextui-org/react';
import React, { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CmnDialogHeaderProps extends Omit<ModalHeaderProps, 'size'> {
  title: string;
  description?: string;
  children?: ReactNode; // Case other header custom by children
  classNames?: string;
  classNamesTitle?: string;
  style?: React.CSSProperties;
}

function CmnDialogHeader(props: CmnDialogHeaderProps) {
  const { title, description, children, classNames, classNamesTitle, style } = props;

  return (
    <ModalHeader className={cn('border-0 p-3 pb-0', classNames)} style={{ ...style }}>
      <div className='flex flex-col'>
        <div className={cn('text-black text-[1.75rem] font-normal leading-[3.15rem] tracking-wider', classNamesTitle)}>
          {title}
        </div>
        {description && (
          <div className='text-black text-xs font-normal leading-[1.313rem] tracking-tight'>{description}</div>
        )}
        {children}
      </div>
    </ModalHeader>
  );
}

export default CmnDialogHeader;
