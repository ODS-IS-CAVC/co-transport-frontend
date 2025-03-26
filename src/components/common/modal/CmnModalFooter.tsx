'use client';
import { Button, ButtonProps, ModalFooter, ModalFooterProps } from '@nextui-org/react';
import React, { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CmnModalFooterProps extends Omit<ModalFooterProps, 'size'> {
  children?: ReactNode;
  classNames?: string;
  style?: React.CSSProperties;
  buttonRightFirst?: ButtonProps;
  buttonRightSecond?: ButtonProps;
  buttonLeftFirst?: ButtonProps;
  gap?: string;
}

function CmnModalFooter(props: CmnModalFooterProps) {
  const { children, classNames, style, gap = 'gap-6' } = props;

  return (
    <ModalFooter
      className={cn(
        `bottom-0 w-full flex items-center justify-between p-8 pt-2`,
        `flex items-center ${gap}`,
        classNames,
      )}
      style={{ ...style }}
    >
      <div className='flex space-x-4 justify-start'>
        {props.buttonLeftFirst && (
          <Button
            color='primary'
            className='text-primary font-bold text-base leading-normal w-[8.5rem] h-12'
            variant='ghost'
            size='lg'
            radius='sm'
            {...props.buttonLeftFirst}
          >
            <span>{props.buttonLeftFirst.children}</span>
          </Button>
        )}
      </div>
      <div className='flex space-x-4 justify-end'>
        {props.buttonRightSecond && (
          <Button
            color='primary'
            variant='ghost'
            className='text-primary font-bold text-base leading-normal w-[8.5rem] h-12'
            size='lg'
            radius='sm'
            {...props.buttonRightSecond}
          />
        )}
        {props.buttonRightFirst && (
          <Button
            color='primary'
            className='font-bold text-base leading-normal w-[8.5rem] h-12'
            size='lg'
            radius='sm'
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

export default CmnModalFooter;
