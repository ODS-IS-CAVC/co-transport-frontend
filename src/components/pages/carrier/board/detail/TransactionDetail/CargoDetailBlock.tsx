import { FC } from 'react';

import { OUT_PACKAGES } from '@/constants/shipper';
import { getCondition } from '@/lib/carrier';
import { currencyFormatWithIcon } from '@/lib/utils';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface Props {
  data: IDetailTransaction;
}

const CargoDetailBlock: FC<Props> = ({ data }) => {
  const { request_snapshot: item } = data;

  return (
    <div className='flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
      <div className='px-6 py-4'>
        <h2 className='mb-4'>荷物詳細</h2>

        <div className='grid grid-cols-12 gap-x-10'>
          <div className='space-y-2 col-span-3'>
            <div className='flex gap-2'>
              <p className='font-bold '>輸送計画ID</p>
              <p>{item?.transport_code}</p>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>運賃</span>
              <span>{item?.price_per_unit && currencyFormatWithIcon(item?.price_per_unit)}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>トレーラ数</span>
              <span>{item?.trailer_number}</span>
            </div>
          </div>

          <div className='space-y-2 col-span-9'>
            <div className='flex gap-2'>
              <span className='font-bold'>品名</span>
              <span>{item?.transport_name}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>品目</span>
              <span>
                {item?.outer_package_code &&
                  OUT_PACKAGES.find((op) => op.key === item?.outer_package_code.toString())?.label}
              </span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>荷物ID</span>
              <span>{item?.operator_code}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>全長</span>
              <span>{item?.total_length}cm</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>全幅</span>
              <span>{item?.total_width}cm</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>全高</span>
              <span>{item?.total_height}cm</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>重量</span>
              <span>{item?.weight || 0}t</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>温度帯</span>
              <span>{item?.temperature_range && getCondition(item?.temperature_range)}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold'>備考</span>
              <span>{item?.special_instructions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargoDetailBlock;
