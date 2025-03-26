'use client';

import { FC } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';

interface ModalSaleProps {
  step: string | undefined;
  saleStatus: boolean;
  data?: string;
  modals: boolean;
  toggleModal: () => void;
}

const ModalSale: FC<ModalSaleProps> = ({ step, data, saleStatus, modals, toggleModal }) => {
  return (
    <CmnModal id={step} isOpen={modals} onClose={toggleModal}>
      <CmnModalHeader
        title={saleStatus ? '予約完了' : 'キャリア間マッチング'}
        description={saleStatus ? '運送能力に予約を行いました。' : 'キャリア間マッチングを実行しました。'}
        classNames='mb-8'
      />
      <CmnModalBody classNames='py-0'>
        {saleStatus ? (
          <div className='font-normal text-sm'>
            <p className='h-6 leading-6 space-y-2'>{data}の運送能力に予約を送信しました。</p>
            <p className='h-6 leading-6 mt-4 space-y-2'>※更新情報は取引ダッシュボードと取引詳細から確認可能です。</p>
          </div>
        ) : (
          <div className='font-normal text-sm'>
            <p className='h-6 leading-6 space-y-2'>運送事業者からキャリア間での運行提案があった場合には、</p>
            <p className='h-6 leading-6 mt-4 space-y-2'>取引ダッシュボード、取引詳細から確認可能です。</p>
          </div>
        )}
      </CmnModalBody>
      <CmnModalFooter
        buttonRightSecond={{
          children: '閉じる',
          onPress: toggleModal,
          className: 'border-1 bg-white text-base text-primary rounded-lg font-bold w-[8.5rem]',
        }}
        buttonRightFirst={{
          children: '取引詳細へ',
          onPress: toggleModal,
          className: `border-1 rounded-lg font-bold w-[8.5rem] ${saleStatus ? '' : 'hidden'}`,
        }}
      />
    </CmnModal>
  );
};

export default ModalSale;
