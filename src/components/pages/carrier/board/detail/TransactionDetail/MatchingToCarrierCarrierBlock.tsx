'use client';

import { Button } from '@nextui-org/react';
import { FC } from 'react';

import { TRANS_EVENT } from '@/constants/transaction';

interface MatchingToCarrierCarrierBlockProps {
  hasMatchingCarrier: boolean;
  eventSale: (type: string) => void;
  eventMatchingCarrierAndCarrier: () => void;
}

const MatchingToCarrierCarrierBlock: FC<MatchingToCarrierCarrierBlockProps> = ({
  eventSale,
  eventMatchingCarrierAndCarrier,
  hasMatchingCarrier,
}) => {
  return (
    <>
      <div className='flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
        <div className='px-6 py-4'>
          <div className='text-[28px] h-6 leading-[1.875rem] font-normal mb-8'>キャリア間マッチング</div>
          <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1 mb-3'>
            <p className='h-6'>この取引は別運送事業者へ運行を委託することが可能です</p>
            <p className='h-6'>別運送事業者へ運行を依頼する場合は、キャリア間マッチング実行ボタンを押してください。</p>
          </div>
          <div className='flex flex-col gap-4'>
            {hasMatchingCarrier && (
              <div className='flex justify-end pr-1'>
                <Button
                  className='rounded-lg text-base font-bold min-w-[8.5rem] h-12 px-8 py-4'
                  color='primary'
                  radius='sm'
                  onPress={eventMatchingCarrierAndCarrier}
                >
                  キャリア間マッチング結果を確認する
                </Button>
              </div>
            )}
            <div className='flex justify-end pr-1'>
              <Button
                className='rounded-lg text-base font-bold min-w-[8.5rem] h-12 px-8 py-4'
                color='primary'
                radius='sm'
                onPress={() => eventSale(TRANS_EVENT.MATCHING_SALE)}
              >
                キャリア間マッチングを実行する
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchingToCarrierCarrierBlock;
