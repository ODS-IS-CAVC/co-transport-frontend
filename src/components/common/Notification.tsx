'use client';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { memo } from 'react';

import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { cn } from '@/lib/utils';
import { actions } from '@/redux';
import { ENotificationType } from '@/types/app';

function Notification() {
  const dispatch = useAppDispatch();

  const modalResult = useAppSelector((state) => state.app.modalResult);

  const typeStyles = {
    error: '!text-error',
    success: '!text-success',
    info: '!text-black',
    warning: '!text-warning',
  };

  const typeStyle = typeStyles[modalResult.type || ENotificationType.INFO];

  const handleClose = () => {
    dispatch(actions.appAction.hideModalResult());
    if (modalResult.onClose) {
      modalResult.onClose();
    }
  };

  return (
    <>
      {modalResult.isShow && (
        <Modal
          radius='sm'
          hideCloseButton
          isDismissable={false}
          onClose={handleClose}
          isOpen={modalResult.isShow}
          className={cn('z-[100]', typeStyle)}
          size={
            (modalResult?.size || 'xl') as 'sm' | 'md' | 'lg' | 'xs' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
          }
        >
          <ModalContent>
            <ModalHeader className='flex flex-col gap-1 text-4xl font-normal p-6 pb-0 text-center'>
              {modalResult?.title || ''}
            </ModalHeader>
            <ModalBody className='p-6'>
              <div className='w-full'>
                {typeof modalResult.content === 'string' ? (
                  <div>
                    <p
                      className={cn(
                        'text-base font-normal text-center',
                        modalResult.type === ENotificationType.ERROR && '!text-foreground',
                      )}
                    >
                      {modalResult.content}
                    </p>

                    <div className='flex items-center justify-center'>
                      <Button
                        radius='sm'
                        color='primary'
                        onPress={handleClose}
                        className='border-none font-bold h-12 w-[6rem] text-base leading-normal mt-6'
                      >
                        閉じる
                      </Button>
                    </div>
                  </div>
                ) : (
                  modalResult?.content || ''
                )}
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default memo(Notification);
