'use client';
import { Modal, ModalContent, ModalProps } from '@nextui-org/react';
import React, { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CmnDialogProps extends Omit<ModalProps, 'size'> {
  children: ReactNode;
  isOpen?: boolean;
  classNameWrap?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: ModalProps['size'] | 'custom';
  customSize?: {
    width: string; // e.g., '500px', '80%'
    height?: string; // e.g., '400px', 'auto'
    marginTop?: string; // e.g., '400px', 'auto'
  };
  scrollBehavior?: ModalProps['scrollBehavior'];
  placement?: ModalProps['placement'];
  backdrop?: ModalProps['backdrop'];
  customProps?: ModalProps;
  onClose?: () => void;
}

function CmnDialog(props: CmnDialogProps) {
  const {
    children,
    isOpen = false,
    classNameWrap,
    className,
    style,
    size = '4xl',
    customSize = { width: '820px', marginTop: '68px' },
    placement = 'center',
    scrollBehavior = placement == 'center' ? 'inside' : 'outside',
    backdrop = 'opaque',
    onClose = () => null,
  } = props;

  const customStyles =
    size === 'custom'
      ? {
          width: customSize?.width || 'auto',
          height: customSize?.height || 'auto',
          maxWidth: customSize?.width || 'auto',
          marginTop: customSize?.marginTop || 'auto',
        }
      : {};

  return (
    <>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <div className={classNameWrap}>
        <Modal
          isOpen={isOpen}
          backdrop={backdrop}
          size={size !== 'custom' ? size : undefined}
          placement={placement}
          className={cn('bg-white rounded-none shadow-lg no-scrollbar', className)}
          hideCloseButton={true}
          onClose={onClose}
          radius='sm'
          scrollBehavior={scrollBehavior}
          aria-labelledby='modal-title'
          aria-describedby='modal-description'
          style={{
            marginTop: placement == 'top' ? customStyles?.marginTop : '',
            marginBottom: placement == 'top' ? customStyles?.marginTop : '',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
            ...style,
            ...customStyles,
          }}
          {...props.customProps}
        >
          <ModalContent>{(onClose) => children}</ModalContent>
        </Modal>
      </div>
    </>
  );
}

export default CmnDialog;
