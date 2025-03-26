'use client';
import { Button, ButtonProps, ModalFooter, ModalFooterProps } from '@nextui-org/react';
import React, { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CmnDialogFooterProps extends Omit<ModalFooterProps, 'size'> {
  children?: ReactNode;
  classNames?: string;
  style?: React.CSSProperties;
  buttonRightFirst?: ButtonProps;
  buttonRightSecond?: ButtonProps;
  buttonLeftFirst?: ButtonProps;
  gap?: string;
}

function CmnDialogFooter(props: CmnDialogFooterProps) {
  const { children, classNames, style, gap = 'gap-6' } = props;

  return (
    <ModalFooter
      className={cn(
        `bottom-0 w-full flex items-center justify-between p-3 pt-0`,
        `flex items-center ${gap}`,
        classNames,
      )}
      style={{ ...style }}
    >
      <div className='flex space-x-4 justify-start'>
        {props.buttonLeftFirst && (
          <Button
            className='text-foreground font-bold bg-white text-base leading-normal h-12 bg-none'
            {...props.buttonLeftFirst}
          >
            <span>{props.buttonLeftFirst.children}</span>
          </Button>
        )}
      </div>
      <div className='flex space-x-4 justify-end'>
        {props.buttonRightSecond && (
          <Button
            className='text-foreground font-bold bg-white text-base leading-normal h-12'
            {...props.buttonRightSecond}
          />
        )}
        {props.buttonRightFirst && (
          <Button
            className='text-foreground font-bold bg-white text-base leading-normal h-12'
            {...props.buttonRightFirst}
          >
            <div className='text-bold'>{props.buttonRightFirst.children}</div>
          </Button>
        )}
      </div>
      {children}
    </ModalFooter>
  );
}

export default CmnDialogFooter;
