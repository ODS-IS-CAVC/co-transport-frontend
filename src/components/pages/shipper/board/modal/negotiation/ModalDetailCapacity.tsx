'use client';

import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';

interface ModalDetailCapacityProps {
  onClose: () => void;
  onSubmit: () => void;
}

const ModalDetailCapacity = ({ onClose, onSubmit }: ModalDetailCapacityProps) => {
  return (
    <>
      <CmnModalHeader
        title='運送能力詳細'
        description={'輸送計画の詳細や進行状況が確認できます。'}
        classNames='mb-0 px-8 pt-8'
        classNamesTitle='mb-8'
      />
      <CmnModalBody classNames='px-8 pt-8'>
        <p className='text-sm font-normal text-foreground'>キャリアの運送能力の項目を表示される</p>
      </CmnModalBody>
      <CmnModalFooter
        classNames='p-8'
        buttonRightFirst={{
          children: 'マッチング確定',
          color: 'primary',
          onPress: onSubmit,
        }}
        buttonRightSecond={{
          children: '一覧に戻る',
          color: 'primary',
          variant: 'bordered',
          onPress: onClose,
        }}
        buttonLeftFirst={{
          children: '閉じる',
          className: 'border-none bg-background underline font-bold',
          onPress: onClose,
        }}
      />
    </>
  );
};

export default ModalDetailCapacity;
