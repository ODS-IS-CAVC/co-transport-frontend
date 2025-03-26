'use client';

import { FC } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';

interface ModalDenyProps {
  step: string;
  modals: boolean | undefined;
  toggleModal: () => void;
}

const ModalDeny: FC<ModalDenyProps> = ({ step, modals, toggleModal }) => {
  return (
    <CmnModal id={step} isOpen={modals} onClose={toggleModal} size='4xl' placement='top' className='min-h-[391px]'>
      <CmnModalHeader
        title={step === '契約' ? '契約不承諾' : '予約不承諾'}
        description={step === '契約' ? '契約を不承諾しました。' : '予約を不承諾しました。'}
        classNames='mb-12'
      />
      <CmnModalBody classNames='py-0'>
        {step && (
          <div className='font-normal text-sm'>
            {step === '予約' ? (
              <>
                <p className='h-6'>荷主からの予約を不承諾しました。</p>
                <p className='h-6 leading-6 space-y-2'>この取引は取引ダッシュボード、取引詳細から削除されます。</p>
              </>
            ) : step === '契約' ? (
              <>
                <p className='h-6'>荷主との契約を不承諾しました。</p>
                <p className='h-6'>この取引は予約状態に戻ります。</p>
                <p className='h-6 leading-6 mt-4 space-y-2'>
                  ※更新情報は取引ダッシュボード、取引詳細から確認可能です。
                </p>
              </>
            ) : null}
          </div>
        )}
      </CmnModalBody>
      <CmnModalFooter
        buttonRightSecond={{
          children: '確定ボードに戻る',
          onPress: toggleModal,
          className: 'border-1 rounded-lg font-bold',
        }}
      />
    </CmnModal>
  );
};

export default ModalDeny;
