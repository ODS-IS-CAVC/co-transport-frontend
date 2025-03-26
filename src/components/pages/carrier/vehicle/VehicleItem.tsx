'use client';

import { Button } from '@nextui-org/react';

import { TEMPERATURE_RANGE, VEHICLE, VEHICLE_TYPE } from '@/constants/common';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { VehicleData } from '@/types/carrier/vehicle';

interface VehicleItemProps {
  index: number;
  item: VehicleData;
  className?: string;
  onUpdateOpenDetail: (status: boolean, id: number) => void;
}

function VehicleItem(props: VehicleItemProps) {
  const { index, item, className, onUpdateOpenDetail = () => null } = props;

  const id = item?.vehicle_info?.id;

  return (
    <>
      <div
        className={cn(
          'border border-gray-border rounded-lg p-2 text-sm font-normal leading-[1.225rem] text-black text-foreground bg-white',
          index && 'mt-2',
          className,
        )}
      >
        <div className='flex justify-between items-center'>
          <p className='text-error font-normal text-xs leading-[1.313rem] ml-10'>
            {item?.vehicle_no_available?.length ? '車両が使用できない日付が設定されています' : ''}
          </p>
          <div className='flex items-center space-x-2'>
            <p className='font-bold text-base leading-6'>車両ID</p>
            <p>{id || ''}</p>
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between mt-2 gap-y-2'>
          <div className='border-1 border-gray-item rounded-lg px-2 py-1 flex flex-wrap space-x-3 items-center text-base font-bold leading-7'>
            <p>機種</p>
            <p className='text-2xl font-medium leading-9'>{item?.vehicle_info?.vehicle_name || ''}</p>
            <p>タイプ</p>
            <p className='text-2xl font-medium leading-9'>
              {item?.vehicle_info?.vehicle_type
                ? item.vehicle_info?.vehicle_type === VEHICLE_TYPE.TRACTOR
                  ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                  : gTxt('COMMON.VEHICLE_TYPE_TRAILER')
                : ''}
            </p>
            {item?.vehicle_info?.vehicle_type !== Number(VEHICLE[1].value) && (
              <>
                <p>温度帯</p>
                {(item?.vehicle_info?.temperature_range || []).map((item) => (
                  <p key={item} className='text-2xl font-medium leading-9 mr-3'>
                    {TEMPERATURE_RANGE[item as keyof typeof TEMPERATURE_RANGE]}
                  </p>
                ))}
              </>
            )}
            <p>車両ナンバー</p>
            <div className='flex items-center text-2xl font-medium leading-9 space-x-2'>
              <p>
                {item?.vehicle_info?.registration_area_code || ''}
                {item?.vehicle_info?.registration_group_number || ''}
              </p>
              <p>{item?.vehicle_info?.registration_character || ''}</p>
              <p>{item?.vehicle_info?.registration_number_1 || ''}</p>
            </div>
          </div>
          <div className='flex flex-1 justify-end ml-4'>
            <Button
              radius='sm'
              color='primary'
              onPress={() => onUpdateOpenDetail(true, id)}
              className='h-12 px-4 text-base font-bold leading-6'
            >
              詳細を見る
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default VehicleItem;
