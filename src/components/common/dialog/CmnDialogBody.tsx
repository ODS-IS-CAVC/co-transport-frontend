'use client';
import { cn, ModalBody, ModalBodyProps } from '@nextui-org/react';
import React, { ReactNode } from 'react';

interface CmnDialogBodyProps extends Omit<ModalBodyProps, 'size'> {
  children: ReactNode;
  classNames?: string;
  style?: React.CSSProperties;
}

function CmnDialogBody(props: CmnDialogBodyProps) {
  const { children, classNames, style } = props;

  return (
    <ModalBody className={cn('p-3 scroll-y-auto', classNames)} style={{ ...style }}>
      {children}
    </ModalBody>
  );
}

export default CmnDialogBody;
