'use client';

import { Button } from '@nextui-org/react';
import { memo, useMemo } from 'react';

import { Icon } from '@/components/common/Icon';
import { VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import dayjs from '@/lib/dayjs';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { getPrefectureName } from '@/lib/prefectures';
import { gTxt } from '@/messages/gTxt';
import { RootState } from '@/redux/store';
import { DeliveryAbility } from '@/types/schedule';

interface ScheduleItemProps {
  item: DeliveryAbility;
  redirectDetailPage: () => void;
  redirectFlightListPage: () => void;
}

const ScheduleItem = memo((props: ScheduleItemProps) => {
  const { item, redirectDetailPage, redirectFlightListPage } = props;

  const regions = useAppSelector((state: RootState) => state.app.locations);

  const formatTime = (time?: string) => {
    return time ? dayjs(time, TIME_FORMAT.HHMM).format(TIME_FORMAT.HH_MM) : '';
  };

  const priceRange = useMemo(() => {
    const vehicleDiagramItemTrailers = Object.values(item.vehicle_diagram_item_trailers);
    if (!vehicleDiagramItemTrailers) return '';
    let minPrice = 0;
    let maxPrice = 0;

    vehicleDiagramItemTrailers.forEach((vehicle, index) => {
      vehicle.days.forEach((day, indexVehicle) => {
        if (day.price && indexVehicle === 0 && index === 0) {
          minPrice = day.price;
          maxPrice = day.price;
        } else {
          if (day.price < minPrice) minPrice = day.price;
          if (day.price > maxPrice) maxPrice = day.price;
        }
      });
    });
    if (minPrice === 0 && maxPrice === 0) return '';
    return `¥ ${handleFormatNumberToCurrency(minPrice)}～¥ ${handleFormatNumberToCurrency(maxPrice)}`;
  }, [item.vehicle_diagram_item_trailers]);

  const cutOffTime = useMemo(() => {
    if (!item.departure_time) return '';
    if (!item.cut_off_price) return '';
    if (Object.keys(item.cut_off_price).length === 0) return '';
    const startTime = dayjs(item.departure_time, TIME_FORMAT.HHMM).format(TIME_FORMAT.HH_MM);
    //get max, min of key of cut_off_price
    let maxCutoff = 0;
    if (item.cut_off_price && Object.keys(item.cut_off_price).length > 0) {
      maxCutoff = Math.max(...Object.keys(item.cut_off_price).map(Number));
    }
    if (maxCutoff === 0) return '';
    const minCutoffTime = dayjs(startTime, TIME_FORMAT.HHMM).add(-maxCutoff, 'hour').format(TIME_FORMAT.HH_MM);
    return `${minCutoffTime}-${startTime}`;
  }, [item.departure_time, item.cut_off_price]);

  const renderTractor = () => {
    const tractor = item.vehicle_diagram_allocations?.find(
      (vehicle) => vehicle.vehicle_info?.vehicle_type === VEHICLE_TYPE.TRACTOR,
    );

    if (!tractor) return null;

    return (
      <div className='flex flex-wrap items-start'>
        <div className='text-base font-medium mr-2'>{gTxt('COMMON.VEHICLE_TYPE_TRACTOR')}</div>
        <div className='flex flex-col items-start justify-end min-w-40 flex-1 px-2 py-1 rounded-lg border border-[#D9D9D9]'>
          <p className='text-[#1E1E1E] truncate min-w-36'>{`${tractor?.vehicle_info?.registration_area_code || ''} ${tractor?.vehicle_info?.registration_group_number || ''} ${tractor?.vehicle_info?.registration_character || ''} ${tractor?.vehicle_info?.registration_number_1 || ''}`}</p>
          <p className='text-[#1E1E1E] truncate min-w-36'>{tractor?.vehicle_info.vehicle_name || ''}</p>
        </div>
      </div>
    );
  };

  const renderTrailer = () => {
    const trailers = item.vehicle_diagram_allocations?.filter(
      (vehicle) => vehicle.vehicle_info?.vehicle_type === VEHICLE_TYPE.TRAILER,
    );

    if (!trailers) return null;

    return (
      <div className='flex flex-wrap items-start'>
        <div className='text-base font-medium mr-2'>{gTxt('COMMON.VEHICLE_TYPE_TRAILER')}</div>
        <div className='flex space-x-2'>
          {trailers.map((trailer) => {
            return (
              <div
                key={`trailer-${trailer.id}`}
                className='flex flex-col items-start justify-end min-w-40 flex-1 px-2 py-1 rounded-lg border border-[#D9D9D9]'
              >
                <p className='text-[#1E1E1E] truncate min-w-36'>{`${trailer?.vehicle_info?.registration_area_code || ''} ${trailer?.vehicle_info?.registration_group_number || ''} ${trailer?.vehicle_info?.registration_character || ''} ${trailer?.vehicle_info.registration_number_1 || ''}`}</p>
                <p className='text-[#1E1E1E] truncate min-w-36'>{trailer?.vehicle_info.vehicle_name || ''}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className='bg-white rounded border border-other-gray p-1'>
      <div className='w-full flex items-center justify-between'>
        <div className='flex flex-wrap items-center'>
          <span className='text-base font-medium'>{'便名 '}</span>
          <span className='text-2xl font-medium'>{item.trip_name}</span>
        </div>
        <div className='flex items-center'>
          <span className='text-base font-medium'>{'登録日 '}</span>
          <span className='text-base'>
            {item.created_date ? dayjs(item.created_date).format(DATE_FORMAT.JAPANESE_DATE) : ''}
          </span>
        </div>
      </div>
      <div className='w-full grid grid-cols-2 gap-3 mt-2'>
        <div className='flex items-center justify-between p-1 border border-[#D9D9D9] rounded'>
          <p className='flex items-center flex-wrap text-xl font-medium'>
            <span className='text-base'>出発&#x3000;</span>
            <span>{getPrefectureName(regions, item.departure_from)}&#x3000;&#x3000;</span>
            <span>{formatTime(item.departure_time)}発</span>
          </p>
          <Icon icon='chevron_right' size={30} />
          <p className='flex items-center flex-wrap text-xl font-medium'>
            <span className='text-base'>到着&#x3000;</span>
            <span>{getPrefectureName(regions, item.arrival_to)}&#x3000;&#x3000;</span>
            <span>{formatTime(item.arrival_time)}着</span>
          </p>
        </div>
        <div className='flex items-center justify-between'>
          <p className='flex items-center text-xl font-medium'>
            {priceRange && (
              <>
                <span className='text-base'>運賃&#x3000;</span>
                <span>{priceRange}</span>
              </>
            )}
          </p>
          <p className='flex items-center text-xl font-medium'>
            {cutOffTime && (
              <>
                <span className='text-base'>カットオフ&#x3000;</span>
                <span>{cutOffTime}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className='flex flex-wrap items-center justify-between mt-2 space-y-2'>
        <div className='flex space-x-3'>
          {/* tractor */}
          {renderTractor()}
          {/* trailer */}
          {renderTrailer()}
        </div>
        <div className='flex flex-1 justify-end space-x-2'>
          <Button radius='sm' color='primary' variant='bordered' className='border-1' onPress={redirectFlightListPage}>
            便一覧を見る
          </Button>
          <Button radius='sm' color='primary' onPress={redirectDetailPage}>
            詳細を見る
          </Button>
        </div>
      </div>
    </div>
  );
});

export default ScheduleItem;
