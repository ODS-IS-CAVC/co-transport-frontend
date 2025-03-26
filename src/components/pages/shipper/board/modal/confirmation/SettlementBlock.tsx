'use client';

import { Checkbox } from '@nextui-org/checkbox';
import { Button } from '@nextui-org/react';
import { FC, useState } from 'react';

import { OrderStatus, TRANS_EVENT } from '@/constants/transaction';
import { formatCurrency } from '@/lib/utils';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface SettlementBlockProps {
  eventAccept?: (type: string) => void;
  data?: IDetailTransaction;
}

const SettlementBlock: FC<SettlementBlockProps> = ({ eventAccept, data }) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckbox = () => {
    setIsChecked((prev) => !prev);
  };
  if (!data) return;

  const price =
    (data.propose_price && formatCurrency(String(data.propose_price))) ||
    (data.propose_snapshot.price && formatCurrency(String(data.propose_snapshot.price))) ||
    0;

  return (
    <>
      {[OrderStatus.SHIPPER_PAYMENT].includes(data.status) && (
        <div className='flex flex-col gap-3 py-8 px-6 w-full h-full border border-gray-border rounded-lg mt-3'>
          <div className='text-foreground text-[28px] h-6 leading-[1.875rem] font-normal mb-4'>決済</div>
          <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1'>
            <p className='h-6'>{`運賃 ${price} 円 の決済が完了しました。`}</p>
          </div>
        </div>
      )}
      {[OrderStatus.COMPLETE_TRANSPORT].includes(data.status) && (
        <div className='flex flex-col gap-3 p-8 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
          <div className='text-[28px] text-foreground h-5 leading-[1.875rem] font-normal mb-4'>決済</div>
          <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1 mb-4'>
            {`運賃 ${price} 円 の決済待ちです。 or 運賃 ${price} 円 の決済が完了しました。`}
          </div>
          <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1 mb-4'>
            <p>ご指定の銀行口座に荷主からのご入金を確認されましたら</p>
            <p>『振込を確認しました』にチェックし、決済確認ボタンを押してください。</p>
          </div>
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
                radius='sm'
                className='text-base text-primary font-bold w-[6.125rem] h-12 text-white'
                color='primary'
                onPress={() => eventAccept && eventAccept(TRANS_EVENT.PAYMENT)}
                isDisabled={!isChecked}
              >
                決済確認
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default SettlementBlock;
