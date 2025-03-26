'use client';

import { FC } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';

interface ModalAcceptProps {
  step: string;
  modals: boolean | undefined;
  toggleModal: () => void;
  toggleStep: () => void;
  scrollable: () => void;
}

const ModalAccept: FC<ModalAcceptProps> = ({ step, modals, toggleModal, toggleStep, scrollable }) => {
  return (
    <CmnModal id={step} isOpen={modals} onClose={toggleModal} size='4xl' placement='top' className='min-h-[391px]'>
      <CmnModalHeader
        title={step === '予約' ? '予約承諾' : step === '契約' ? '契約承諾' : '決済確認'}
        description={
          step === '予約を承諾しました。'
            ? '予約承諾'
            : step === '契約'
              ? '契約を承諾しました。'
              : '予約を承諾しました。'
        }
        classNames='mb-12'
      />
      <CmnModalBody classNames='py-0'>
        {step === '予約' && (
          <div className='font-normal text-sm'>
            <p className='h-6'>荷主と運送事業者の予約承諾が完了しました。</p>
            <p className='h-6 leading-6 space-y-2'>契約へお進みください。</p>
            <p className='h-6 leading-6 mt-4 space-y-2'>※更新情報は取引ダッシュボード、取引詳細から確認可能です。</p>
          </div>
        )}
        {step === '契約' && (
          <div className='font-normal text-sm'>
            <p className='h-6'>荷主と運送事業者の契約承諾が完了しました。</p>
            <p className='h-6 leading-6 space-y-2'>決済確認へお進みください。</p>
            <p className='h-6 leading-6 mt-4 space-y-2'>※更新情報は取引ダッシュボード、取引詳細から確認可能です。</p>
          </div>
        )}
        {step === '決済' && (
          <div className='font-normal text-sm'>
            <p className='h-6'>荷主からの運賃振込と決済確認が完了しました。</p>
            <p className='h-6 leading-6 space-y-2'>運行へお進みください。</p>
            <p className='h-6 leading-6 mt-4 space-y-2'>※更新情報は取引ダッシュボード、取引詳細から確認可能です。</p>
          </div>
        )}
      </CmnModalBody>
      <CmnModalFooter
        buttonRightSecond={{
          children: '閉じる',
          onPress: () => {
            toggleModal();
            scrollable();
            toggleStep();
          },
          className: 'border-1 rounded-lg font-bold w-[8.5rem]',
        }}
      />
    </CmnModal>
  );
};

export default ModalAccept;
