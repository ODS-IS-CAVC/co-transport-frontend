'use client';

import { Button, Card, CardBody, CardHeader, Skeleton } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useCallback } from 'react';

import { Icon } from '@/components/common/Icon';
import { OUTER_PACKAGE, TransType } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { ITransportPlanSale } from '@/types/shipper/transport';

interface ItemTradingProps {
  dataItem?: ITransportPlanSale;
  showDetail?: (id: number) => void;
  totalMatching?: number;
  isModal?: boolean;
}

const ItemTrading = ({ dataItem, showDetail, totalMatching = 0, isModal }: ItemTradingProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const collectionDate =
    dataItem?.trans_type === TransType.CARRIER ? dataItem?.transport_date : dataItem?.collection_date;
  const price = dataItem?.trans_type === TransType.CARRIER ? dataItem?.propose_price : dataItem?.price_per_unit;

  const timeTo =
    dataItem?.trans_type === TransType.CARRIER ? dataItem?.propose_arrival_time : dataItem?.collection_time_to;
  const getNaviTime = useCallback(() => {
    if (!timeTo) return '';
    const startTime = dayjs(timeTo, TIME_FORMAT.HHMM).add(1.5, 'hour');
    const endTime = startTime.add(3, 'hour');
    return `${startTime.format(TIME_FORMAT.HH_MM)} - ${endTime.format(TIME_FORMAT.HH_MM)}`;
  }, [dataItem]);

  return (
    <Card
      className={`w-full mb-2 rounded-lg flex-shrink-0 ${!isModal ? 'border border-gray-border' : ''}`}
      shadow='none'
    >
      <CardHeader className={`flex items-center justify-end text-sm pb-0 p-2 gap-2`}>
        <Button
          className={`text-base text-neutral font-bold h-8 rounded-lg leading-normal tracking-wide flex-shrink-0 bg-other-gray mr-auto pointer-events-none`}
        >
          マッチなし
        </Button>
        <div className='flex gap-2 text-foreground text-sm font-normal flex-wrap'>
          <p className={`whitespace-nowrap`}>
            <span className='font-bold'>荷主</span> &nbsp;
            <span>{dataItem?.operatorName}</span>
          </p>
          {/* <div className={`whitespace-nowrap flex`}>
            <span className='font-bold'>事業者</span> &nbsp;
            <span>{!dataItem ? <Skeleton as='span' className='w-20 h-6' /> : dataItem.transport_name}</span>
          </div> */}
          <div className='whitespace-nowrap flex'>
            <span className='font-bold'>登録日</span> &nbsp;
            <span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-20 h-6' />
              ) : (
                dataItem.created_date && dayjs(dataItem.created_date).format(DATE_FORMAT.JAPANESE_DATE)
              )}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody className={`pb-2 pt-0 flex flex-col gap-2 px-2`}>
        <div className='text-foreground tracking-wide flex items-center gap-2'>
          <span className='text-sm leading-tight font-bold'>品名</span> &nbsp;
          {!dataItem ? (
            <Skeleton as={'span'} className='w-10 h-9' />
          ) : (
            <span className='text-2xl leading-9 font-medium'>{dataItem.transport_name}</span>
          )}
          <span className='text-sm leading-tight font-bold'>品目</span> &nbsp;
          {!dataItem ? (
            <Skeleton as={'span'} className='w-10 h-9' />
          ) : (
            <span className='text-2xl leading-9 font-medium'>
              {OUTER_PACKAGE.find((outer) => outer.key === `${dataItem.outer_package_code}`)?.label || ''}
            </span>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-[20px]'>
          <div className={`flex items-center gap-[20px] ${isModal ? 'w-full' : ''}`}>
            <div
              className={`border-default border rounded-lg flex flex-col justify-center items-center h-[4.5rem] px-4 ${isModal ? 'w-full' : 'w-[17.5rem]'}`}
            >
              <div className='text-base font-normal leading-7 tracking-wide flex gap-4'>
                {!dataItem ? (
                  <Skeleton as={'span'} className='w-32 h-6 mt-1' />
                ) : (
                  <span className='text-foreground whitespace-nowrap'>
                    {collectionDate && dayjs(collectionDate).format(DATE_FORMAT.JAPANESE_DATE)}
                  </span>
                )}
                <span className='text-foreground flex gap-2 whitespace-nowrap'>
                  {!dataItem ? (
                    <Skeleton as={'span'} className='w-10 h-6 mt-1' />
                  ) : (
                    dataItem.collection_time_from && formatTime(dataItem.collection_time_from, TIME_FORMAT.HHMM)
                  )}
                  -{' '}
                  {!dataItem ? (
                    <Skeleton as={'span'} className='w-10 h-6 mt-1' />
                  ) : (
                    dataItem.collection_time_to && formatTime(dataItem.collection_time_to, TIME_FORMAT.HHMM)
                  )}
                </span>
              </div>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-8 mt-4 mb-1' />
              ) : (
                <p className='text-foreground text-2xl font-medium leading-9 tracking-wide'>
                  {getPrefectureName(regions, dataItem.departure_from)}
                </p>
              )}
            </div>
            <Icon icon='keyboard_arrow_right' className='text-[#5A5A5A]' size={24} />
            <div
              className={`border-default border rounded-lg flex flex-col justify-center items-center h-[4.5rem] px-4 ${isModal ? 'w-full' : 'w-[17.5rem]'}`}
            >
              <div className='text-base font-normal leading-7 tracking-wide flex gap-4'>
                {!dataItem ? (
                  <Skeleton as={'span'} className='w-32 h-6 mt-1' />
                ) : (
                  <span className='text-foreground whitespace-nowrap'>
                    {collectionDate && dayjs(collectionDate).format(DATE_FORMAT.JAPANESE_DATE)}
                  </span>
                )}
                <span className='text-foreground flex gap-2 whitespace-nowrap'>{getNaviTime()}</span>
              </div>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-8 mt-4 mb-1' />
              ) : (
                <p className='text-foreground text-2xl font-medium leading-9 tracking-wide'>
                  {getPrefectureName(regions, dataItem.arrival_to)}
                </p>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2 whitespace-nowrap'>
            <span className={`text-foreground font-bold text-sm`}>運賃</span>
            {!dataItem ? (
              <Skeleton as={'span'} className='w-24 h-6' />
            ) : (
              <span className={`${isModal ? 'text-primary' : 'text-foreground'} font-medium text-2xl`}>
                {dataItem ? currencyFormatWithIcon(price || 0) : ''}
              </span>
            )}
          </div>
          <Button
            className={`text-neutral w-[7.1875rem] h-12 font-bold ml-auto text-base self-end flex-shrink-0 ${isModal && 'hidden'}`}
            size='sm'
            color='primary'
            radius='sm'
            onPress={() => showDetail && dataItem && showDetail(dataItem.id)}
          >
            詳細を見る
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ItemTrading;
