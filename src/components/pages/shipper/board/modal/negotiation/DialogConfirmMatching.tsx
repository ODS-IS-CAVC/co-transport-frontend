'use client';

import CmnDialogBody from '@/components/common/dialog/CmnDialogBody';
import CmnDialogFooter from '@/components/common/dialog/CmnDialogFooter';
import CmnDialogHeader from '@/components/common/dialog/CmnDialogHeader';

interface DialogConfirmMatchingProps {
  onClose: () => void;
  onSubmit: () => void;
}

const DialogConfirmMatching = ({ onClose, onSubmit }: DialogConfirmMatchingProps) => {
  return (
    <>
      <CmnDialogHeader title='このマッチングを確定しますか？' classNames='mb-0 px-8 pt-8' />
      <CmnDialogBody classNames='px-8 pt-8 mb-8'>
        <p className='text-sm font-normal text-foreground'>よろしければOKボタンを押してください。</p>
        <p className='text-sm font-normal text-foreground'>事業者にマッチング確定が通知されます。</p>
      </CmnDialogBody>
      <CmnDialogFooter
        classNames='p-8'
        buttonRightFirst={{
          children: 'OK',
          onPress: onSubmit,
        }}
        buttonRightSecond={{
          children: 'キャンセル',
          onPress: onClose,
        }}
      />
    </>
  );
};

export default DialogConfirmMatching;
