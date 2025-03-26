'use client';

import { Button, Card, CardBody, CardHeader, Chip } from '@nextui-org/react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import { Icon } from '@/components/common/Icon';
import { TransType } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { KEY_COOKIE_DEBUG } from '@/constants/keyStorage';
import { OrderStatus } from '@/constants/transaction';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import dayjs from '@/lib/dayjs';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { Matching, MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { cn, currencyFormatWithIcon, formatCutOffTime, getCookie } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { ITrailer, ITransportMatching } from '@/types/carrier/transport';

interface ItemProps {
  item: ITransportMatching;
  type: 'trading' | 'transaction' | 'matching';
  showDetail: () => void;
  handleEmergency?: (ids: number[], remove: boolean) => void;
  eventRequest: (status: number, trailer: ITrailer) => void;
}

const formatTime = (time?: string) => (time ? dayjs(time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM) : '--');

const TrailerCard = ({
  item,
  type,
  trailer,
  trailerStt,
  eventRequest,
}: {
  item: ITransportMatching;
  type: 'trading' | 'transaction' | 'matching';
  trailer: ITrailer;
  trailerStt: { color: string; label: string; status: Matching };
  eventRequest: (status: number, trailer: ITrailer) => void;
}) => {
  const { cut_off_info } = trailer;
  const cutOffTimes = [...new Set(cut_off_info?.map((item) => item.cutOffTime) ?? [])].sort((a, b) => b - a);
  const maxCutOffTime = cutOffTimes.length > 0 ? cutOffTimes[0] : 0;

  const renderCutoffTime = () => {
    if (trailerStt.status === Matching.MATCH_OK || trailerStt.label === 'マッチなし') {
      if (maxCutOffTime === 0) return '--:--';
      return `${dayjs(item?.service_strt_time, TIME_FORMAT.HH_MM)
        .subtract(Number(maxCutOffTime || 0), 'hour')
        .format(TIME_FORMAT.HH_MM)}-${dayjs(item?.service_strt_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)}`;
    }

    return `${formatCutOffTime(Number(trailer.cut_off_time))} ${handleFormatNumberToCurrency(trailer.cut_off_fee ?? 0)}円`;
  };

  return (
    <>
      <div className='flex items-start'>
        <div className='flex items-center gap-2'>
          {trailer.trans_type === TransType.CARRIER && (
            <Chip
              className={cn('h-8 px-0 rounded-lg text-white text-sm leading-3 mb-1', trailerStt.color)}
              size='lg'
              radius='sm'
            >
              キャリア間
            </Chip>
          )}
          <Button
            className={cn('h-8 px-2 rounded-lg text-white text-sm leading-3 mb-1', trailerStt.color)}
            size='sm'
            onPress={() => eventRequest(trailerStt.status, trailer)}
          >
            {trailerStt.label}
          </Button>
        </div>
      </div>
      <div className='flex justify-between items-start'>
        <div className='flex flex-col justify-start'>
          <p className='text-foreground'>{trailer.trailer_license_plt_num_id || '----'}</p>
          <p>{`${trailer.vehicle_name ?? ''} ${getCondition(trailer.temperature_range)}`}</p>
        </div>
        <div className='border-l border-default flex flex-col justify-end h-full' />
        <div className='flex flex-col space-y-1 justify-end'>
          <div className='flex items-center gap-0.5'>
            <span className='text-foreground font-bold text-base'>運賃</span>
            <span className='font-normal text-sm'>
              {currencyFormatWithIcon(Number(trailer.price) + Number(trailer.cut_off_fee))}
            </span>
          </div>
          <div className='flex items-center gap-0.5'>
            <span className='text-foreground font-bold text-base'>カットオフ</span>
            <span className='font-normal text-sm'>{renderCutoffTime()}</span>
          </div>
        </div>
      </div>
    </>
  );
};

const Item = ({ item, type, eventRequest, showDetail, handleEmergency }: ItemProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);
  const { truck, trailer_1, trailer_2 } = item;

  // Sort trailers by display_order and assign to array
  const trailers = [trailer_1, trailer_2].sort((a, b) => Number(a.display_order) - Number(b.display_order));

  const hasEmergency = trailers.some((trailer) => trailer?.is_emergency);
  const hasDecision = trailers.some(
    (trailer) =>
      Number(trailer?.order_status) === OrderStatus.MAKE_CONTRACT ||
      Number(trailer?.order_status) === OrderStatus.CARRIER_MAKE_CONTRACT ||
      Number(trailer?.order_status) === OrderStatus.TRANSPORT_DECISION ||
      Number(trailer?.order_status) === OrderStatus.TRANSPORT_DECIDED,
  );
  const orderIds: number[] = trailers.flatMap((item) => (item.order_id ? [Number(item.order_id)] : []));
  const debug = getCookie(KEY_COOKIE_DEBUG) as string | null;

  return (
    <Card className='w-full border border-gray-border rounded-lg' shadow='none'>
      <CardHeader className='text-sm pb-0 p-2 gap-2 flex justify-between'>
        <div className='flex text-foreground text-sm items-center gap-2'>
          {hasEmergency && (
            <Chip size='lg' radius='sm' color='danger' className='h-8 px-0 text-white text-sm leading-3 mb-1'>
              緊急
            </Chip>
          )}
          <p className='text-base font-bold'>便名</p>
          <p className='text-2xl font-semibold whitespace-nowrap flex'>{item.service_name}</p>
        </div>
        <div className='flex text-[#000000] text-base gap-2'>
          <span className='whitespace-nowrap flex gap-2'>
            <p className='font-bold'>登録日</p>
            <p>{dayjs(item.created_at).format(DATE_FORMAT.JAPANESE_DATE)}</p>
          </span>
          <span className='whitespace-nowrap flex gap-2'>
            <p className='font-bold'>運送日</p>
            <p>{dayjs(item.service_strt_date).format(DATE_FORMAT.JAPANESE_DATE)}</p>
          </span>
        </div>
      </CardHeader>
      <CardBody className='pb-2 pt-0 flex flex-col gap-3 px-2'>
        <div className='flex gap-2 items-center justify-between'>
          <div className='flex items-center px-2 py-1 gap-3 border border-default rounded-lg'>
            <p className='text-base font-bold'>出発</p>
            <p className='text-2xl font-medium'>
              {`${getPrefectureName(regions, +item.departure_from)} ${formatTime(item.service_strt_time)}発`}
            </p>
            <Icon icon='keyboard_arrow_right' size={24} />
            <p className='text-base font-bold'>到着</p>
            <p className='text-2xl font-medium'>
              {`${getPrefectureName(regions, +item.arrival_to)} ${formatTime(item.service_end_time)}着`}
            </p>
          </div>
          {debug !== 'undefined' && hasDecision && (
            <CmnCheckboxGroup
              name='transType'
              title=''
              defaultValue={(hasEmergency && ['1']) || []}
              onChange={(e) => handleEmergency && handleEmergency(orderIds, !e.length)}
              option={[
                {
                  key: '1',
                  label: '緊急',
                  value: '1',
                },
              ]}
            />
          )}
        </div>
        <div className='grid grid-cols-6 gap-2 text-base'>
          <div className='col-span-1'>
            <p className='text-base font-bold'>トラクター</p>
          </div>
          <div className='col-span-5'>
            <p className='text-base font-bold'>トレーラ</p>
          </div>
        </div>
        <div className='grid grid-cols-6 gap-[0.375rem] text-base'>
          <div className='col-span-1 py-[0.375rem] px-[0.625rem] border border-default rounded-lg max-w-40 flex flex-col justify-center'>
            <p className='text-foreground'>{truck?.car_license_plt_num_id}</p>
            <p>{truck?.vehicle_name ?? ''}</p>
          </div>
          <div className='col-span-5 flex gap-1 justify-between'>
            {trailers.map((trailer, index) => {
              if (!trailer?.trailer_license_plt_num_id) return;
              const trailerStt = MatchingHelper.getTrailerStatus(trailer);
              return (
                <div
                  key={index}
                  className={cn('flex flex-col justify-between border border-default rounded-lg p-2 w-5/12')}
                >
                  <TrailerCard
                    trailer={trailer}
                    trailerStt={trailerStt}
                    eventRequest={eventRequest}
                    item={item}
                    type={type}
                  />
                </div>
              );
            })}
            <div className='w-2/12 flex flex-col justify-end items-end space-y-2'>
              <Button
                className='text-neutral font-bold text-base w-11/12'
                size='lg'
                color='primary'
                radius='sm'
                onPress={showDetail}
              >
                詳細を見る
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Item;
