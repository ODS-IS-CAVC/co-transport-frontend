'use client';

import { Button } from '@nextui-org/react';

import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';

interface ModalRequestCompleteProps {
  onClose: () => void;
  dataItem?: any;
}

const ModalRequestComplete = ({ onClose, dataItem }: ModalRequestCompleteProps) => {
  return (
    <>
      <CmnModalHeader title='輸送依頼を送信しました' classNamesTitle='tracking-[4%]' />
      <CmnModalBody classNames='px-8 pt-8 text-foreground text-sm'>
        <p>{dataItem?.operator_name}の運行情報に輸送依頼を送信しました。</p>
        <p>更新情報は確定ボードから確認可能です。</p>
        <Button
          size='sm'
          className='h-12 w-[6.125rem] mt-16 mb-4 self-center'
          color='primary'
          radius='sm'
          onPress={onClose}
        >
          閉じる
        </Button>
      </CmnModalBody>
    </>
  );
};

export default ModalRequestComplete;
