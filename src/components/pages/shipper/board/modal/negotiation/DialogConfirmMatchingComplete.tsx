'use client';

import CmnDialogBody from '@/components/common/dialog/CmnDialogBody';
import CmnDialogFooter from '@/components/common/dialog/CmnDialogFooter';
import CmnDialogHeader from '@/components/common/dialog/CmnDialogHeader';

interface DialogConfirmMatchingCompleteProps {
  onClose: () => void;
  onSubmit: () => void;
}

const DialogConfirmMatchingComplete = ({ onClose, onSubmit }: DialogConfirmMatchingCompleteProps) => {
  return (
    <>
      <CmnDialogHeader title='マッチングが確定しました' classNames='mb-0 px-8 pt-8' />
      <CmnDialogBody classNames='px-8 pt-8 mb-8'>
        <p className='text-sm font-normal text-foreground'>取引内容の確認、取引の進行は確定ボードから行えます。</p>
      </CmnDialogBody>
      <CmnDialogFooter
        classNames='p-8'
        buttonRightFirst={{
          children: '確定ボードへ移行する',
          onPress: onSubmit,
        }}
        buttonLeftFirst={{
          children: '閉じる',
          onPress: onClose,
        }}
      />
    </>
  );
};

export default DialogConfirmMatchingComplete;
