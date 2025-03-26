'use client';

import { Button, Card, CardBody, Chip } from '@nextui-org/react';
import { memo } from 'react';

import { OUTER_PACKAGE, STATUS_CARGO, TEMPERATURE_RANGE } from '@/constants/common';
import { cn } from '@/lib/utils';
import { CargoInfo } from '@/types/shipper/cargo';

interface CargoInfoItemProps {
  item: CargoInfo;
  companyName: string;
  showModalDetailInfo: () => void;
}

const CargoInfoItem = memo(({ item, companyName, showModalDetailInfo }: CargoInfoItemProps) => {
  const tempRangeString = (item?.temp_range || [])
    .map((range) => TEMPERATURE_RANGE[range as keyof typeof TEMPERATURE_RANGE])
    .join(', ');

  return (
    <Card className='w-full border border-gray-border rounded-lg' shadow='none'>
      <CardBody className='flex flex-col items-center p-2'>
        <div className='w-full flex items-center justify-between'>
          <Chip
            className={cn('text-white text-base font-bold', item?.status === 1 ? 'bg-other-gray' : 'bg-warning')}
            radius='sm'
          >
            {(STATUS_CARGO as Record<number, string>)[item?.status]}
          </Chip>
          <div className='flex items-center space-x-3 text-base leading-7 font-normal'>
            <div>
              <span className='font-bold'>荷物ID </span>
              <span>{item?.id}</span>
            </div>
            <div>
              <span className='font-bold'>事業者 </span>
              <span>{companyName || '未定'}</span>
            </div>
            <div>
              <span className='font-bold'>登録日 </span>
              <span>{item?.created_date}</span>
            </div>
          </div>
        </div>
        <div className='mt-2 flex justify-between items-center w-full gap-2'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <p className='font-bold text-base left-7'>品名</p>
              <p className='text-2xl leading-9 font-bold'>{item?.cargo_name}</p>
            </div>
            <div className='flex items-center gap-1'>
              <p className='font-bold text-base left-7'>品目</p>
              <p className='text-2xl leading-9 font-bold'>
                {OUTER_PACKAGE.find((outer) => outer?.key === `${item?.outer_package_code}`)?.label || ''}
              </p>
            </div>
            <div className='flex items-center gap-1'>
              <p className='font-bold text-base left-7'>温度帯</p>
              <p className='text-2xl leading-9 font-bold'>{tempRangeString}</p>
            </div>
          </div>
          <div className='flex flex-col gap-4'>
            <Button size='lg' radius='sm' color='primary' className='text-base font-bold' onPress={showModalDetailInfo}>
              詳細を見る
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

export default CargoInfoItem;
