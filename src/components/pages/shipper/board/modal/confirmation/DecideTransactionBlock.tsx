'use client';

import { FC } from 'react';

interface DecideTransactionBlockProps {}

const DecideTransactionBlock: FC<DecideTransactionBlockProps> = () => {
  return (
    <div className='flex flex-col gap-3 p-8 w-full text-foreground border border-gray-border rounded-lg'>
      <h3 className='text-[28px]'>運行決定</h3>
      <p className='text-sm font-normal'>運行が正常に決定されました。</p>
    </div>
  );
};

export default DecideTransactionBlock;
