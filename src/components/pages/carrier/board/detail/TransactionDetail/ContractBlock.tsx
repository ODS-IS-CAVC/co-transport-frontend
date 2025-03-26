'use client';

import { Checkbox } from '@nextui-org/checkbox';
import { Button, Link } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useState } from 'react';

import { OrderStatus, TRANS_EVENT } from '@/constants/transaction';
import negotiation from '@/image/negotiation.png';
import { Matching } from '@/lib/matching';
import DownloadService from '@/services/download';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface ContractBlockProps {
  data?: IDetailTransaction;
  type: number;
  eventAccept?: (type: string) => void;
  eventDeny?: (type: string) => void;
}

const ContractBlock: FC<ContractBlockProps> = ({ data, eventAccept, eventDeny, type }) => {
  const contractSrc = '/contract.pdf';
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckbox = () => {
    setIsChecked((prev) => !prev);
  };

  const handleDownload = (url: string, name?: string) => {
    const downloadService = new DownloadService(url, name);
    downloadService.download();
  };

  const openPDF = () => {
    window.open(contractSrc, '_blank');
  };

  return (
    <div className='flex flex-col gap-4 px-6 py-4 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
      <h2 className='mb-4'>2. 契約</h2>
      {data &&
        eventDeny &&
        eventAccept &&
        [
          OrderStatus.SHIPPER_APPROVED,
          OrderStatus.CARRIER_APPROVED,
          OrderStatus.CARRIER_APPROVED_PROCESS,
          OrderStatus.CARRIER_APPROVED_PROCESS_2,
        ].includes(data.status) && (
          <>
            <div className='flex flex-col'>
              <div className='text-black text-sm font-normal leading-[1.313rem] tracking-tight'>
                契約内容を確認してください。
              </div>
            </div>
            <div className='flex flex-col text-sm h-full font-normal leading-5 gap-3'>
              <div className='mt-10 relative flex justify-center items-center w-[32.625rem] h-[49.063rem] overflow-hidden overflow-y-auto scrollbar-custom mx-auto'>
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
                    className='text-base font-bold w-[9.25rem] h-12'
                    color='primary'
                    radius='sm'
                    onPress={() =>
                      type === Matching.TRANSACTION_SHIPPER
                        ? eventAccept(TRANS_EVENT.CONTRACT_ACCEPT)
                        : eventAccept(TRANS_EVENT.CARRIER_CONTRACT_ACCEPT)
                    }
                    isDisabled={!isChecked}
                  >
                    契約を承諾する
                  </Button>
                </div>
                <div className='self-end pr-1'>
                  <Button
                    className='text-base font-bold w-[10.3125rem] h-12'
                    color='primary'
                    radius='sm'
                    onPress={() =>
                      type === Matching.TRANSACTION_SHIPPER
                        ? eventDeny(TRANS_EVENT.CONTRACT_REJECT)
                        : eventDeny(TRANS_EVENT.CARRIER_CONTRACT_REJECT)
                    }
                  >
                    契約を不承諾する
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      {data &&
        [
          OrderStatus.MAKE_CONTRACT,
          OrderStatus.CARRIER_MAKE_CONTRACT,
          OrderStatus.TRANSPORT_DECISION,
          OrderStatus.TRANSPORT_DECIDED,
          OrderStatus.START_TRANSPORT,
          OrderStatus.TRANSPORT_ONGOING,
          OrderStatus.COMPLETE_TRANSPORT,
          OrderStatus.SHIPPER_PAYMENT,
        ].includes(data.status) && (
          <>
            <div className='flex flex-col text-sm h-full font-normal leading-5 gap-2'>
              <p className='h-6 mb-3'>契約内容を承諾しました。</p>
              <Link
                underline='always'
                className='text-sm cursor-pointer'
                onPress={() => handleDownload(contractSrc, 'contract.pdf')}
              >
                契約書をダウンロードする(pdfファイル)
              </Link>
            </div>
            <div className='flex justify-end pr-1'>
              <Button
                className='rounded-lg text-base font-bold w-[8.25rem] h-12'
                color='primary'
                radius='sm'
                onPress={openPDF}
              >
                契約書を開く
              </Button>
            </div>
          </>
        )}
    </div>
  );
};

export default ContractBlock;
