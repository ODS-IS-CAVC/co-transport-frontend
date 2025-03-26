'use client';

import { Checkbox } from '@nextui-org/checkbox';
import { Button, Link } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useState } from 'react';

import { OrderStatus, TRANS_EVENT } from '@/constants/transaction';
import negotiation from '@/image/negotiation.png';
import DownloadService from '@/services/download';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface ContractBlockProps {
  data?: IDetailTransaction;
  eventAccept?: (type: string) => void;
  eventDeny?: (type: string) => void;
}

const ContractBlock: FC<ContractBlockProps> = ({ data, eventAccept, eventDeny }) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  const handleDownload = (url: string, name?: string) => {
    const downloadService = new DownloadService(url, name);
    downloadService.download();
  };

  return (
    <>
      {data && [OrderStatus.SHIPPER_APPROVED, OrderStatus.CARRIER_APPROVED].includes(data.status) && (
        <div className='flex flex-col gap-4 p-8 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
          <div className='flex flex-col'>
            <div className='text-[28px] h-6 leading-[1.875rem] font-normal mb-8'>契約</div>
            <div className='text-black text-sm font-normal leading-[1.313rem] tracking-tight'>
              契約内容を確認してください。
            </div>
          </div>
          <div className='flex flex-col text-sm h-full font-normal leading-5 gap-3'>
            <div className='mt-10 relative flex justify-center items-start w-[32.625rem] h-[49.063rem] overflow-hidden overflow-y-auto scrollbar-custom'>
              <Image className='absolute top-0 object-contain w-full' src={negotiation} alt='Background image' />
            </div>
            <Link underline='none' className='text-sm cursor-pointer underline'>
              契約書をダウンロードする(pdfファイル)
            </Link>
            <div className='px-1 py-2'>
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
                <span className='text-foreground'>契約内容を承諾する</span>
              </Checkbox>
            </div>
            <div className='flex flex-col gap-3'>
              <div className='self-end pr-1'>
                <Button
                  radius='sm'
                  className='text-base text-primary font-bold w-[9.25rem] h-12 text-white'
                  color='primary'
                  onPress={() => eventAccept && eventAccept(TRANS_EVENT.CONTRACT_ACCEPT)}
                  isDisabled={!isChecked}
                >
                  契約を承諾する
                </Button>
              </div>
              <div className='self-end pr-1'>
                <Button
                  radius='sm'
                  className='text-base text-primary font-bold w-[10.3125rem] h-12 text-white'
                  color='primary'
                  onPress={() => eventDeny && eventDeny(TRANS_EVENT.CONTRACT_REJECT)}
                >
                  契約を不承諾する
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {data &&
        [
          OrderStatus.MAKE_CONTRACT,
          OrderStatus.TRANSPORT_DECISION,
          OrderStatus.START_TRANSPORT,
          OrderStatus.COMPLETE_TRANSPORT,
          OrderStatus.SHIPPER_PAYMENT,
        ].includes(data.status) && (
          <div className='flex flex-col gap-3 p-8 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
            <div className='text-[28px] text-foreground h-6 leading-[1.875rem] font-normal mb-4'>契約</div>
            <div className='flex flex-col text-sm h-full font-normal leading-5 gap-2'>
              <p className='h-6 mb-3'>契約内容を承諾しました。</p>
              <Link
                underline='always'
                className='text-sm cursor-pointer'
                onPress={() => handleDownload('/path/to/your/template.xlsx')}
              >
                契約書をダウンロードする(pdfファイル)
              </Link>
            </div>
            <div className='flex justify-end pr-1'>
              <Button
                className='rounded-lg border border-primary text-base text-primary font-bold w-[8.25rem] h-12 text-white'
                color='primary'
              >
                契約書を開く
              </Button>
            </div>
          </div>
        )}
    </>
  );
};

export default ContractBlock;
