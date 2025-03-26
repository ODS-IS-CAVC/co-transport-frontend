import { Button, Chip, cn } from '@nextui-org/react';
import { memo, useCallback } from 'react';

import { Icon } from '@/components/common/Icon';
import { OUTER_PACKAGE, STATUS_TRANSPORT_INFO_FORM } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import dayjs from '@/lib/dayjs';
import { getPrefectureName } from '@/lib/prefectures';
import { formatCurrency } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { TransportInfo } from '@/types/shipper/transportList';

interface TransportItemProps {
  item: TransportInfo;
  onViewDetail: (id: number) => void;
}

export const TransportItem = memo(({ item, onViewDetail }: TransportItemProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);
  const formatTime = useCallback((time?: string) => {
    return time ? dayjs(time, TIME_FORMAT.HHMM).format(TIME_FORMAT.HH_MM) : '';
  }, []);

  const formatDate = useCallback((date?: string) => {
    return date ? dayjs(date, DATE_FORMAT.YYYYMMDD).format(DATE_FORMAT.JAPANESE_DATE) : '';
  }, []);

  const getNaviTime = useCallback(() => {
    if (!item.transport_plan.collection_time_to) return '';
    // start time =  collection_date_to + 1.5h
    const startTime = dayjs(item.transport_plan.collection_time_to, TIME_FORMAT.HHMM).add(1.5, 'hour');
    // end time = startTime + 3h
    const endTime = dayjs(startTime, TIME_FORMAT.HHMM).add(3, 'hour');
    return `${startTime.format(TIME_FORMAT.HH_MM)} - ${endTime.format(TIME_FORMAT.HH_MM)}`;
  }, [item.transport_plan.collection_time_to]);

  return (
    <div className='bg-white rounded border border-[#555555] p-2'>
      <div className='w-full flex items-center justify-between'>
        <Chip
          radius='sm'
          className={cn('text-base text-white', `bg-${item.transport_plan.is_private ? 'warning' : 'other-gray'}`)}
        >
          {STATUS_TRANSPORT_INFO_FORM.find((status) => status.key === (item.transport_plan.is_private ? '1' : '0'))
            ?.label || ''}
        </Chip>
        <div className='flex items-center space-x-2 text-sm'>
          <span className='font-bold'>事業者:</span>
          <span>{item.transport_plan.company_name}</span>
          <span className='font-bold'>登録日:</span>
          <span>{formatDate(item.transport_plan.created_at)}</span>
        </div>
      </div>
      <div className='flex items-end space-x-6'>
        <div className='flex flex-col'>
          {item.transport_plan_cargo_info.slice(0, 3).map((cargo, index) => (
            <div key={cargo.cargo_info_id} className='flex items-center space-x-6'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-bold'>荷物{index + 1}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-bold'>品名</span>
                <span className='text-xl font-bold'>{cargo.cargo_name}</span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-bold'>品目</span>
                <span className='text-xl font-bold'>
                  {OUTER_PACKAGE.find((outer) => outer?.key === `${cargo.outer_package_code}`)?.label || ''}
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-sm font-bold'>希望運賃</span>
                <span className='text-xl font-bold'>¥ {formatCurrency(cargo.price_per_unit?.toString() || '0')}</span>
              </div>
            </div>
          ))}
        </div>
        {item.transport_plan_cargo_info.length > 3 && (
          <span className='text-sm font-bold'>{`他  登録荷物${item.transport_plan_cargo_info.length - 3}`}</span>
        )}
      </div>
      <div className='flex items-center justify-between flex-wrap mt-2 space-x-2'>
        <div className='flex items-center justify-center'>
          <div className='min-w-[15.625rem] flex flex-col items-center justify-center border border-gray-border rounded px-3 py-1'>
            <div className='flex space-x-3'>
              <span className='text-base'>{formatDate(item.transport_plan.collection_date_from)}</span>
              <span className='text-base'>
                {formatTime(item.transport_plan.collection_time_from)} -{' '}
                {formatTime(item.transport_plan.collection_time_to)}
              </span>
            </div>
            <span className='text-2xl font-medium'>
              {getPrefectureName(regions, item.transport_plan.departure_from) || <>&#x3000;</>}
            </span>
          </div>
          <div className='w-16 flex items-center justify-center'>
            <Icon icon='chevron_right' size={30} />
          </div>
          <div className='min-w-[15.625rem] flex flex-col items-center justify-center border border-gray-border rounded px-3 py-1'>
            <div className='flex space-x-3'>
              <span className='text-base'>{formatDate(item.transport_plan.collection_date_to)}</span>
              <span className='text-base'>{getNaviTime()}</span>
            </div>
            <span className='text-2xl font-medium'>
              {getPrefectureName(regions, item.transport_plan.arrival_to) || <>&#x3000;</>}
            </span>
          </div>
        </div>
        <div className='flex-1 flex items-end justify-between space-x-2'>
          <div className='flex flex-col items-start justify-center'>
            <span className='font-bold'>必要トレーラ数 {item.transport_plan.trailer_number}</span>
            <div className='flex items-center justify-center space-x-2'>
              <span className='font-bold'>計画運賃（/day）</span>
              <span className='text-2xl font-medium'>
                ¥ {formatCurrency(item.transport_plan.price_per_unit?.toString() || '0')}
              </span>
            </div>
          </div>
          <Button
            size='lg'
            radius='sm'
            color='primary'
            className='text-base font-bold'
            onPress={() => onViewDetail(item.transport_plan.id)}
          >
            詳細を見る
          </Button>
        </div>
      </div>
    </div>
  );
});
