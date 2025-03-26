'use client';
import { memo, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { cn } from '@/lib/utils';
import { actions } from '@/redux';
import { ENotificationType } from '@/types/app';

import { Icon } from './Icon';

function NotificationMain() {
  const dispatch = useAppDispatch();

  const notification = useAppSelector((state) => state.app.notification);

  const typeStyles = {
    error: 'bg-[#FEE9E7] !text-[#900B09] border-error',
    success: 'bg-white border-success !text-success',
    info: 'bg-white !text-black',
    warning: 'bg-white border-warning !text-warning',
  };

  const typeStyle = typeStyles[notification.type || ENotificationType.INFO];

  useEffect(() => {
    if (notification.isShow) {
      const timer = setTimeout(() => {
        dispatch(actions.appAction.hideNotification());
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.isShow, notification.duration, dispatch]);

  return (
    <>
      {notification.isShow && (
        <div className={cn('flex flex-col items-start border rounded-md mt-4 mx-2 tl:mx-0 px-3 py-2 ', typeStyle)}>
          <div className='flex w-full items-start'>
            <div className='flex items-center mt-1'>
              <Icon icon='info' size={20} className={`text-${typeStyle}`} />
            </div>

            <div className='flex-1 px-4'>
              <p className='text-base font-semibold'>{notification.title}</p>
              <div className='w-full'>
                {typeof notification.content === 'string' ? (
                  <p className='text-base font-normal'>{notification.content}</p>
                ) : (
                  notification.content
                )}
              </div>
            </div>
            <button
              onClick={() => dispatch(actions.appAction.hideNotification())}
              className='rounded-full flex items-center justify-center mt-1'
            >
              <Icon icon='close' size={16} className={`text-${typeStyle}`} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(NotificationMain);
