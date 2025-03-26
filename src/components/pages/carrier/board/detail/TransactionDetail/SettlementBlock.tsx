'use client';

import { Checkbox } from '@nextui-org/checkbox';
import { Button, cn } from '@nextui-org/react';
import { FC, useState } from 'react';

import { OrderStatus, TRANS_EVENT } from '@/constants/transaction';
import { Matching } from '@/lib/matching';
import { formatCurrency } from '@/lib/utils';

interface SettlementBlockProps {
  className?: string;
  price?: any;
  type?: number;
  event?: (type: string) => void;
  status: number;
}

const SettlementBlock: FC<SettlementBlockProps> = ({ className, price, type, event, status }) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  return (
    <>
      {[OrderStatus.SHIPPER_PAYMENT, OrderStatus.CARRIER_PAYMENT].includes(status) && (
        <div className='flex flex-col gap-3 py-4 px-6 w-full h-full border border-gray-border rounded-lg mt-3'>
          <div className='text-foreground text-[28px] h-6 leading-[1.875rem] font-normal mb-4'>5. 決済</div>
          <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1'>
            <p className='h-6'>{`運賃 ${formatCurrency(String(price))} 円 の決済が完了しました。`}</p>
          </div>
        </div>
      )}
      {[OrderStatus.COMPLETE_TRANSPORT, OrderStatus.TRANSPORT_COMPLETED].includes(status) && (
        <div
          className={cn(
            'flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg mb-3',
            className,
          )}
        >
          <div className='px-6 py-4'>
            <div className='text-[28px] h-5 leading-[1.875rem] font-normal mb-8'>5. 決済</div>
            <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1'>
              <p className='h-6'>
                {type === Matching.TRANSACTION_SHIPPER &&
                  `運賃 ${formatCurrency(String(price))}  円 のシッパー決済待ちです。`}

                {type === Matching.MATCHING_CARRIER && `運賃 ${formatCurrency(String(price))} 円 の決済待ちです。`}
              </p>
            </div>
            <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1'>
              <p className='h-6'>ご指定の銀行口座に荷主からのご入金を確認されましたら、</p>
              <p className='h-6'>『振込を確認しました』にチェックし、決済確認ボタンを押してください。</p>
            </div>
            <br />
            <div className='flex justify-start mb-3'>
              <Checkbox
                radius='none'
                classNames={{
                  base: 'sm mr-2',
                  wrapper: 'rounded-none',
                  icon: 'before:border-1',
                }}
                isSelected={isChecked}
                onChange={handleCheckbox}
              >
                <span className='text-foreground'>振込を確認しました</span>
              </Checkbox>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='self-end pr-1'>
                <Button
                  className='text-base font-bold min-w-[8.5rem] h-12 px-8 py-4'
                  color='primary'
                  radius='sm'
                  onPress={() =>
                    event
                      ? event(type === Matching.TRANSACTION_SHIPPER ? TRANS_EVENT.PAYMENT : TRANS_EVENT.CARRIER_PAYMENT)
                      : {}
                  }
                  isDisabled={!isChecked}
                >
                  決済確認
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default SettlementBlock;
