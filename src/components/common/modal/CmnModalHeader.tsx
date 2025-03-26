import { ModalHeader, ModalHeaderProps } from '@nextui-org/react';
import React, { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CmnModalHeaderProps extends Omit<ModalHeaderProps, 'size' | 'title'> {
  title: string | ReactNode;
  description?: string;
  children?: ReactNode; // Case other header custom by children
  classNames?: string;
  classNamesTitle?: string;
  style?: React.CSSProperties;
}

function CmnModalHeader(props: CmnModalHeaderProps) {
  const { title, description, children, classNames, classNamesTitle, style } = props;

  return (
    <ModalHeader className={cn('border-0 p-8 pb-0', classNames)} style={{ ...style }}>
      <div className='flex flex-col flex-1'>
        {typeof title === 'string' ? (
          <div className={cn('text-black text-4xl font-normal leading-[3.15rem] tracking-wider mb-4', classNamesTitle)}>
            {title}
          </div>
        ) : (
          title
        )}
        {description && (
          <div className='h-auto text-black text-xs font-normal leading-[1.313rem] tracking-tight'>{description}</div>
        )}
        {children}
      </div>
    </ModalHeader>
  );
}

export default CmnModalHeader;
