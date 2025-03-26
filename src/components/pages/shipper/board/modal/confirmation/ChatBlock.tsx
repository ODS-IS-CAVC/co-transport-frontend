'use client';

import { Button } from '@nextui-org/react';
import { FC } from 'react';

import { DATE_FORMAT } from '@/constants/constants';
import dayjs from '@/lib/dayjs';
import { MESSAGE_TRANSACTIONS } from '@/types/carrier/transactionInfo';

interface ChatBlockProps {
  data?: MESSAGE_TRANSACTIONS;
  eventChat: () => void;
}

const ChatBlock: FC<ChatBlockProps> = ({ data, eventChat }) => {
  return (
    <div className='flex flex-col gap-3 p-8 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
      <div className='text-[28px] h-6 leading-[1.875rem] font-normal mb-8'>取引メッセージ(最新)</div>
      <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1'>
        <p className='h-6'>
          {data && data.date ? dayjs(data.date).format(DATE_FORMAT.JAPANESE) : ''} {data?.time}
        </p>
        <p className='h-6'>{data?.from}</p>
        <p className='h-6'>{data?.message}</p>
      </div>
      <div className='flex justify-end pr-1'>
        <Button
          className='rounded-lg border border-primary text-base text-primary font-bold h-12 w-[10.3125rem] text-white'
          color='primary'
          onPress={eventChat}
        >
          メッセージを送る
        </Button>
      </div>
    </div>
  );
};

export default ChatBlock;
