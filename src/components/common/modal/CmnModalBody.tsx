'use client';
import { cn, ModalBody, ModalBodyProps } from '@nextui-org/react';
import React, { ReactNode } from 'react';

interface CmnModalBodyProps extends Omit<ModalBodyProps, 'size'> {
  children: ReactNode;
  classNames?: string;
  style?: React.CSSProperties;
}

function CmnModalBody(props: CmnModalBodyProps) {
  const { children, classNames, style } = props;

  return (
    <ModalBody className={cn('p-8 pt-0 pb-4 scroll-y-auto min-h-32', classNames)} style={{ ...style }}>
      {children}
    </ModalBody>
  );
}

export default CmnModalBody;
