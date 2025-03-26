'use client';

import { Button } from '@nextui-org/react';
import { FC } from 'react';

import { OrderStatus, TRANS_EVENT } from '@/constants/transaction';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface FooterProps {
  data?: IDetailTransaction;
  onClose: () => void;
  eventDeny?: (type: string) => void;
}

const Footer: FC<FooterProps> = ({ data, eventDeny, onClose }) => {
  if (!data) return;

  return (
    <div className='flex justify-between items-center mt-8 gap-2'>
      <Button
        radius='sm'
        className='bg-background text-base text-primary font-bold w-[10.3125rem] h-12 mr-auto'
        onPress={onClose}
      >
        確定ボードへ戻る
      </Button>
      <Button radius='sm' className='text-base text-primary font-bold w-[8.25rem] h-12 text-white' color='primary'>
        便詳細を見る
      </Button>
      {data && [OrderStatus.WAIT_CARRIER_APPROVE, OrderStatus.WAIT_CARRIER_APPROVE_2].includes(data.status) && (
        <Button
          radius='sm'
          className='text-base text-primary font-bold w-[10.3125rem] h-12 text-white'
          color='primary'
          onPress={() => eventDeny && eventDeny(TRANS_EVENT.CANCEL)}
        >
          提案を取り消す
        </Button>
      )}
    </div>
  );
};

export default Footer;
