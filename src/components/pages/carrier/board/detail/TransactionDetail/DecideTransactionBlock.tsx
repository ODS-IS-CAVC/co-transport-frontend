'use client';

import { Button } from '@nextui-org/react';
import { FC } from 'react';

import { OrderStatus } from '@/constants/transaction';
import { Matching } from '@/lib/matching';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface DecideTransactionBlockProps {
  data: IDetailTransaction;
  type: number;
  handleDecideTransaction?: (id: number, type: 'carrier-carrier' | 'carrier-shipper') => void;
}

const DecideTransactionBlock: FC<DecideTransactionBlockProps> = ({ data, handleDecideTransaction, type }) => {
  const isMatchingCarrier = type === Matching.MATCHING_CARRIER;
  return (
    <div className='flex flex-col gap-3 px-6 py-4 w-full text-foreground border border-gray-border rounded-lg mb-3'>
      <h3 className='text-[28px]'>3. 運行決定</h3>

      {[OrderStatus.MAKE_CONTRACT, OrderStatus.CARRIER_MAKE_CONTRACT].includes(data.status) ? (
        <Button
          className='text-base font-bold w-[8.5rem] h-12 lg:px-8 md:px-4 self-end py-4'
          color='primary'
          radius='sm'
          onPress={() =>
            handleDecideTransaction &&
            handleDecideTransaction(data.id, isMatchingCarrier ? 'carrier-carrier' : 'carrier-shipper')
          }
        >
          運行決定
        </Button>
      ) : (
        <p className='text-sm font-normal'>運行が正常に決定されました。</p>
      )}
    </div>
  );
};

export default DecideTransactionBlock;
