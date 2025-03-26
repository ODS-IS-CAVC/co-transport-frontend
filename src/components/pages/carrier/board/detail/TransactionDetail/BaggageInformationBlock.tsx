'use client';

import { Button } from '@nextui-org/react';
import { FC } from 'react';

import { OUTER_PACKAGE } from '@/constants/common';
import { DATE_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import dayjs from '@/lib/dayjs';
import { getPrefectureName } from '@/lib/prefectures';
import { formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface BaggageInformationProps {
  data: IDetailTransaction;
}

const BaggageInformationBlock: FC<BaggageInformationProps> = ({ data }) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const packageCode =
    OUTER_PACKAGE.find((outer) => outer.key === `${data.shipper_info?.request_snapshot?.outer_package_code}`)?.label ||
    '';

  const prefectureFrom =
    (data.shipper_info?.departure_from && getPrefectureName(regions, data.shipper_info.departure_from)) || '';
  const prefectureTo =
    (data.shipper_info?.arrival_to && getPrefectureName(regions, data.shipper_info?.arrival_to)) || '';

  const temperaturePropose =
    (data.propose_snapshot?.temperature_range && getCondition(data.propose_snapshot.temperature_range)) || '指定なし';

  return (
    <div className='flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
      <div className='px-6 py-4'>
        <div className='text-[28px] h-6 leading-[1.875rem] font-normal mb-8'>荷物情報</div>
        <div className='flex flex-row'>
          <div className='flex flex-col gap-1 mb-6 text-sm'>
            <p className='h-6'>登録された輸送計画</p>
            <p className='h-6'>荷主 : {data.shipper_operator_name}</p>
            <p className='h-6'>荷物 : {packageCode}</p>
            <p className='h-6'>
              運送区間 : {prefectureFrom} ～ {prefectureTo}
            </p>
            <p className='h-6'>温度帯 : {temperaturePropose}</p>
            <p className='h-6'>
              希望運送日時 :{' '}
              {data.shipper_info?.transport_date
                ? dayjs(data.shipper_info?.transport_date).format(DATE_FORMAT.JAPANESE)
                : ''}{' '}
              {data.shipper_info?.request_collection_time_from
                ? formatTime(data.shipper_info?.request_collection_time_from)
                : ''}
              -
              {data.shipper_info?.request_collection_time_to
                ? formatTime(data.shipper_info?.request_collection_time_to)
                : ''}{' '}
            </p>
          </div>
        </div>
        <div className='flex justify-end pr-1'>
          <Button className='rounded-lg text-base font-bold min-w-[8.5rem] h-12 px-8 py-4' color='primary' radius='sm'>
            荷主会社情報を見る
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BaggageInformationBlock;
