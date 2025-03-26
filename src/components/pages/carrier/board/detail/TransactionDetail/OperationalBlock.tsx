'use client';

import { FC } from 'react';

import { getCondition } from '@/lib/carrier';
import { IDetailTransaction, subTrailerType } from '@/types/carrier/transactionInfo';

interface OperationalBlockProps {
  data: IDetailTransaction;
  dataSubTrailer: subTrailerType;
  isMatchingCarrier: boolean;
}

const OperationalBlock: FC<OperationalBlockProps> = ({ data, dataSubTrailer, isMatchingCarrier }) => {
  const sortedData =
    data.car_info && Array.isArray(data.car_info)
      ? [...data.car_info].sort((a, b) => (b.tractor_idcr === '1' ? 1 : -1))
      : [];

  const firstTrailer = dataSubTrailer.isFirstTrailer ? dataSubTrailer : data;
  const secondTrailer = !dataSubTrailer.isFirstTrailer ? dataSubTrailer : data;

  return (
    <div className='flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
      <div className='px-6 py-4'>
        <div className='text-[28px] h-6 leading-[1.875rem] font-normal mb-8'>運行編成</div>
        <div className='flex flex-col mb-6'>
          {sortedData &&
            sortedData.map((item, index) => (
              <div className='grid grid-cols-12 gap-2' key={index}>
                <div className='flex col-span-6 gap-2'>
                  <span className='font-bold'>{item.tractor_idcr === '1' ? 'トラクタ: ' : 'トレーラ:'}</span>
                  <span>
                    {item.tractor_idcr === '1' ? item?.car_license_plt_num_id : item?.trailer_license_plt_num_id}{' '}
                    {item.temperature_range && getCondition(item.temperature_range)}
                  </span>
                </div>
                <div className='flex col-span-3 gap-2'>
                  <span className='font-bold'>キャリア:</span>
                  <span>
                    {item.tractor_idcr === '1'
                      ? data.carrier_operator_name
                      : index === 1
                        ? firstTrailer.carrier_operator_name
                        : secondTrailer.carrier_operator_name}
                  </span>
                </div>
                {item?.tractor_idcr !== '1' && (
                  <div className='flex col-span-3 gap-2'>
                    <span className='font-bold'>シッパー</span>
                    <span>
                      {index === 1 ? firstTrailer.shipper_operator_name : secondTrailer?.shipper_operator_name}
                    </span>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default OperationalBlock;
