'use client';

import { Button, Card, CardBody, CardHeader, cn } from '@nextui-org/react';

import { Icon } from '@/components/common/Icon';
import Status from '@/components/pages/carrier/board/Status';
import { TransType } from '@/constants/common';
import { TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import dayjs from '@/lib/dayjs';
import { formatDateWithWeekDayJapanese } from '@/lib/helper';
import { MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, isNullObject } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { ITransportMatching } from '@/types/carrier/transport';

interface MatchingItemProps {
  item: ITransportMatching;
  showDetail: () => void;
}

const TransactionItem = (props: MatchingItemProps) => {
  const { item, showDetail } = props;

  const regions = useAppSelector((state: RootState) => state.app.locations);

  const { truck, trailer_1: trailer1, trailer_2: trailer2 } = item;

  const trailer1Stt = MatchingHelper.getTrailerStatus(trailer1);
  const trailer2Stt = MatchingHelper.getTrailerStatus(trailer2);

  return (
    <Card className='w-full border border-gray-border rounded-lg' shadow='none'>
      <CardHeader className={`text-sm pb-0 p-2 gap-2 flex justify-between`}>
        <div className='flex text-foreground text-sm items-center'>
          <div className='flex gap-2'>
            <Status data={trailer1Stt} type={trailer1.trans_type === TransType.CARRIER} />
            <Status data={trailer2Stt} type={trailer2.trans_type === TransType.CARRIER} />
          </div>
        </div>
        <div className='flex text-[#000000] text-base gap-2'>
          <span className='whitespace-nowrap flex gap-2'>
            <p className='font-bold'>登録日</p>
            <p>{item.created_at && formatDateWithWeekDayJapanese(new Date(item.created_at))}</p>
          </span>
          <span className='whitespace-nowrap flex gap-2'>
            <p className='font-bold'>運送日</p>
            <p>{item.service_strt_date && formatDateWithWeekDayJapanese(new Date(item.service_strt_date))}</p>
          </span>
        </div>
      </CardHeader>
      <CardBody className='pb-2 pt-0 flex flex-col gap-3 px-2'>
        <div className='flex gap-2'>
          <div className='flex items-center gap-2'>
            <p className='text-base font-bold'>便名</p>
            <p className='text-2xl font-medium'>{item.service_name}</p>
          </div>
          <div className='flex items-center px-2 py-1 gap-3 border border-default rounded-lg'>
            <p className='text-base font-bold'>出発</p>
            <p className='text-2xl font-medium'>
              {`${getPrefectureName(regions, +item.departure_from)} ${
                item.service_strt_time
                  ? dayjs(item?.service_strt_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)
                  : '--:--'
              }発`}
            </p>
            <Icon icon='keyboard_arrow_right' size={24} />
            <p className='text-base font-bold'>到着</p>
            <p className='text-2xl font-medium'>
              {`${getPrefectureName(regions, +item.arrival_to)} ${
                item.service_end_time
                  ? dayjs(item.service_end_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)
                  : '--:--'
              }着`}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-6 gap-3 text-base'>
          <div className='col-span-1'>
            <p className='text-base font-bold'>トラクター</p>
          </div>
          <div className='col-span-5'>
            <p className='text-base font-bold'>トレーラ</p>
          </div>
        </div>
        <div className='grid grid-cols-6 gap-[0.375rem] text-base'>
          <div className='col-span-1 space-y-2 py-[0.375rem] px-[0.625rem] flex flex-col justify-center border-default border rounded-lg max-w-[9.6875rem]'>
            <p className='text-foreground'>{truck?.car_license_plt_num_id}</p>
            <p className='!mt-[0.375rem]'>{`${truck?.vehicle_name ?? ''}`}</p>
          </div>
          <div
            className={cn(
              'col-span-2 flex space-y-2 justify-between',
              !isNullObject(trailer1) && 'border-default border rounded-lg w-full p-2',
            )}
          >
            {!isNullObject(trailer1) && (
              <>
                <div className='flex flex-col'>
                  <div>
                    <p className='text-foreground flex gap-2'>{trailer1.trailer_license_plt_num_id || '----'}</p>
                    <p>{`${trailer1.vehicle_name ?? ''} ${getCondition(trailer1.temperature_range)}`}</p>
                  </div>
                </div>
                <div className='flex flex-col justify-end border-l border-default pl-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-bold text-base'>運賃</span>
                    <span className='font-normal text-sm'>{currencyFormatWithIcon(+trailer1.price)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-bold text-base'>カットオフ</span>
                    <span className='font-normal text-sm'>{`${
                      item.service_strt_time
                        ? dayjs(item?.service_strt_time, TIME_FORMAT.HH_MM)
                            .subtract(Number(trailer1.cut_off_time || 0), 'hour')
                            .format(TIME_FORMAT.HH_MM)
                        : '--:--'
                    }`}</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div
            className={cn(
              'col-span-2 flex space-y-2 justify-between',
              !isNullObject(trailer2) && 'border-default border rounded-lg w-full p-2',
            )}
          >
            {!isNullObject(trailer2) && (
              <>
                <div className='flex flex-col'>
                  <div>
                    <p className='text-foreground flex gap-2'>{trailer2.trailer_license_plt_num_id || '----'}</p>
                    <p>{`${trailer2.vehicle_name ?? ''} ${getCondition(trailer2.temperature_range)}`}</p>
                  </div>
                </div>
                <div className='flex flex-col justify-end border-l border-default pl-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-bold text-base'>運賃</span>
                    <span className='font-normal text-sm'>{currencyFormatWithIcon(+trailer2.price)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-foreground font-bold text-base'>カットオフ</span>
                    <span className='font-normal text-sm'>
                      {`${
                        item.service_strt_time
                          ? dayjs(item?.service_strt_time, TIME_FORMAT.HH_MM)
                              .subtract(Number(trailer2.cut_off_time || 0), 'hour')
                              .format(TIME_FORMAT.HH_MM)
                          : '--:--'
                      }`}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className='col-span-1 flex flex-col justify-end items-end space-y-2'>
            <Button
              className='text-neutral w-[7.1875rem] font-bold text-base'
              size='lg'
              color='primary'
              radius='sm'
              onPress={showDetail}
            >
              詳細を見る
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TransactionItem;
