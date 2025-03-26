'use client';

import { Button, Chip } from '@nextui-org/react';
import dayjs from 'dayjs';
import React from 'react';

import { Icon } from '@/components/common/Icon';
import { TEMPERATURE_RANGE, VEHICLE_TYPE } from '@/constants/common';
import { useAppSelector } from '@/hook/useRedux';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { RootState } from '@/redux/store';
import { DataFlightListItem } from '@/types/schedule';

import Status from '../../board/Status';

interface FlightItemProps {
  dataItem: DataFlightListItem;
  onUpdateOpenDetail: (status: boolean, id: number) => void;
}

function FlightItem(props: FlightItemProps) {
  const { dataItem, onUpdateOpenDetail = () => null } = props;
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const getTractor = (dataItem?.vehicle_diagram_allocations || []).find(
    (data) => data?.vehicle_type === VEHICLE_TYPE.TRACTOR,
  );

  const getTrailer = (dataItem?.vehicle_diagram_allocations || []).filter(
    (data) => data?.vehicle_type === VEHICLE_TYPE.TRAILER,
  );

  const getItemTrailer = (id: number) => {
    return (dataItem?.vehicle_diagram_item_trailer || []).find((value) => id === value?.vehicle_diagram_allocation_id);
  };

  const trailer1 = getItemTrailer(getTrailer[0]?.id || 0);
  const trailer2 = getItemTrailer(getTrailer[1]?.id || 0);

  const trailer1Stt = trailer1 ? MatchingHelper.getTrailerStatus(trailer1 as any) : null;
  const trailer2Stt = trailer2 ? MatchingHelper.getTrailerStatus(trailer2 as any) : null;

  const showContentInitialization = (
    <div className='rounded-lg border border-other-gray p-3 flex flex-col mt-4 gap-2'>
      <div className='flex flex-wrap items-center justify-between'>
        <p className='flex items-center mr-2 text-black min-w-fit'>
          <span className='font-bold mr-2'>便名</span>
          <span className='text-2xl font-medium leading-9'>{dataItem?.trip_name || ''}</span>
        </p>
        <p className='text-base font-normal left-7'>
          <span className='text-black font-bold mr-2'>登録日</span>
          {dataItem?.created_date ? dayjs(dataItem?.created_date).locale('ja').format('YYYY年MM月DD日(ddd)') : ''}
          <span className='text-black font-bold mx-2'>運送日</span>
          {dataItem?.day ? dayjs(dataItem?.day).locale('ja').format('YYYY年MM月DD日(ddd)') : ''}
        </p>
      </div>

      <div className='border border-gray-item rounded-lg flex items-center px-2 py-1 w-fit'>
        <p className='flex items-center text-black'>
          <span className='font-bold'>出発</span>
          <span className='mx-2 text-2xl font-medium leading-9'>
            {getPrefectureName(regions, dataItem?.departure_from) || ''}{' '}
            {dataItem?.departure_time ? dayjs(dataItem?.departure_time, 'HH:mm').format('HH:mm') : '00:00'}発
          </span>
        </p>
        <Icon icon='chevron_forward' className='mx-4 text-[#5A5A5A]' size={30} />
        <p className='flex items-center text-black'>
          <span className='font-bold'>到着</span>
          <span className='mx-2 text-2xl font-medium leading-9'>
            {getPrefectureName(regions, dataItem?.arrival_to) || ''}{' '}
            {dataItem?.arrival_time ? dayjs(dataItem?.arrival_time, 'HH:mm').format('HH:mm') : '00:00'}着
          </span>
        </p>
      </div>

      {getTrailer?.length ? (
        <>
          <div className='flex flex-wrap gap-6 justify-end'>
            <div>
              <p className='font-bold mb-1'>トラクター</p>
              <div className='min-w-40 min-h-28 border border-gray-item rounded-lg p-2'>
                <p className='whitespace-nowrap'>{`${getTractor?.vehicle_info?.registration_area_code || ''} ${getTractor?.vehicle_info?.registration_group_number || ''} ${getTractor?.vehicle_info?.registration_character || ''} ${getTractor?.vehicle_info?.registration_number_1 || ''}`}</p>
                <p className='whitespace-nowrap'>{getTractor?.vehicle_info?.vehicle_name || ''}</p>
              </div>
            </div>

            <div className='flex flex-col flex-1'>
              <p className='font-bold mb-1'>トレーラ</p>
              <div className='flex flex-wrap flex-1 gap-2'>
                {getTrailer?.length && getTrailer[0] ? (
                  <div className='min-h-28 flex-1 border border-gray-item rounded-lg p-2'>
                    {trailer1Stt && <Status data={trailer1Stt} type={false} />}
                    <div className='flex items-center'>
                      <div className='border-r-1 border-gray-item pr-2'>
                        <p className='whitespace-nowrap'>{`${getTrailer[0]?.vehicle_info?.registration_area_code || ''} ${getTrailer[0]?.vehicle_info?.registration_group_number || ''} ${getTrailer[0]?.vehicle_info?.registration_character || ''} ${getTrailer[0]?.vehicle_info?.registration_number_1 || ''}`}</p>
                        <p>
                          <span className='mr-2'>{getTrailer[0]?.vehicle_info?.vehicle_name || ''}</span>
                          {(getTrailer[0]?.vehicle_info?.temperature_range || []).map((value) => (
                            <span key={value} className='mr-2'>
                              {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className='pl-2 font-normal text-black'>
                        <div className='flex space-x-3'>
                          <p className='font-bold whitespace-nowrap'>運賃</p>
                          <p className='whitespace-nowrap'>{`¥ ${handleFormatNumberToCurrency(getItemTrailer(getTrailer[0]?.id || 0)?.price || 0) || ''}`}</p>
                        </div>
                        <div className='flex space-x-3'>
                          <p className='font-bold whitespace-nowrap'>カットオフ</p>
                          <p className='whitespace-nowrap'>{dataItem?.cutoff_time || '00:00'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <React.Fragment />
                )}
                {getTrailer[1] ? (
                  <div className='min-h-28 flex-1 border border-gray-item rounded-lg p-2'>
                    {trailer2Stt && <Status data={trailer2Stt} type={false} />}
                    <div className='flex items-center'>
                      <div className='border-r-1 border-gray-item pr-2'>
                        <p className='whitespace-nowrap'>{`${getTrailer[1]?.vehicle_info?.registration_area_code || ''} ${getTrailer[1]?.vehicle_info?.registration_group_number || ''} ${getTrailer[1]?.vehicle_info?.registration_character || ''} ${getTrailer[1]?.vehicle_info?.registration_number_1 || ''}`}</p>
                        <p>
                          <span className='mr-2'>{getTrailer[1]?.vehicle_info?.vehicle_name || ''}</span>
                          {(getTrailer[1]?.vehicle_info?.temperature_range || []).map((value) => (
                            <span key={value} className='mr-2'>
                              {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className='pl-2 text-black font-normal'>
                        <div className='flex space-x-3'>
                          <p className='whitespace-nowrap font-bold'>運賃</p>
                          <p className='whitespace-nowrap'>{`¥ ${handleFormatNumberToCurrency(getItemTrailer(getTrailer[1]?.id || 0)?.price || 0) || ''}`}</p>
                        </div>
                        <div className='flex space-x-3'>
                          <p className='font-bold whitespace-nowrap'>カットオフ</p>
                          <p className='whitespace-nowrap'>{dataItem?.cutoff_time || '00:00'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex-1' />
                )}
              </div>
            </div>

            <div className='flex items-end'>
              <Button
                radius='sm'
                color='primary'
                onPress={() => onUpdateOpenDetail(true, dataItem.id)}
                className='h-12 px-4 text-base font-bold leading-6'
              >
                詳細を見る
              </Button>
            </div>
          </div>
        </>
      ) : (
        <React.Fragment />
      )}
    </div>
  );

  const inProgress = (
    <div className='rounded-lg border border-other-gray p-3 flex flex-col mt-4 gap-2'>
      <div className='flex flex-wrap items-center justify-between'>
        <div className='flex items-center'>
          <Chip radius='sm' className='bg-warning h-8 w-[4.125rem] text-white text-base font-bold leading-6 mr-2'>
            進行中
          </Chip>
          <Chip radius='sm' className='bg-[#555555] h-8 w-[5.125rem] text-white text-base font-bold leading-6 mr-2'>
            走行直前
          </Chip>
        </div>
        <p className='text-base font-normal left-7'>
          <span className='text-black font-bold mr-2'>登録日</span>
          {dataItem?.created_date ? dayjs(dataItem?.created_date).locale('ja').format('YYYY年MM月DD日(ddd)') : ''}
          <span className='text-black font-bold mx-2'>運送日</span>
          {dataItem?.day ? dayjs(dataItem?.day).locale('ja').format('YYYY年MM月DD日(ddd)') : ''}
        </p>
      </div>

      <div className='flex flex-wrap items-center'>
        <p className='flex items-center space-x-2 mr-2 text-black min-w-fit'>
          <span className='font-bold '>便名</span>
          <span className='text-2xl font-medium leading-9'>{dataItem?.trip_name || ''}</span>
        </p>

        <div className='border border-gray-item rounded-lg flex items-center px-2 py-1 mt-2 w-fit'>
          <p className='flex items-center text-black'>
            <span className='font-bold whitespace-nowrap'>出発</span>
            <span className='mx-2 text-2xl font-medium leading-9'>
              {getPrefectureName(regions, dataItem?.departure_from) || ''}{' '}
              {dataItem?.departure_time ? dayjs(dataItem?.departure_time, 'HH:mm').format('HH:mm') : '00:00'}発
            </span>
          </p>
          <Icon icon='chevron_forward' className='mx-4 text-[#5A5A5A]' size={30} />
          <p className='flex items-center text-black'>
            <span className='font-bold whitespace-nowrap'>到着</span>
            <span className='mx-2 text-2xl font-medium leading-9'>
              {getPrefectureName(regions, dataItem?.arrival_to) || ''}{' '}
              {dataItem?.arrival_time ? dayjs(dataItem?.arrival_time, 'HH:mm').format('HH:mm') : '00:00'}着
            </span>
          </p>
        </div>
      </div>

      {getTrailer?.length ? (
        <>
          <div className='flex flex-wrap gap-6 justify-end'>
            <div>
              <p className='font-bold mb-1'>トラクター</p>
              <div className='min-w-40 min-h-28 border border-gray-item rounded-lg p-2'>
                <p className='whitespace-nowrap'>{`${getTractor?.vehicle_info?.registration_area_code || ''} ${getTractor?.vehicle_info?.registration_group_number || ''} ${getTractor?.vehicle_info?.registration_character || ''} ${getTractor?.vehicle_info?.registration_number_1 || ''}`}</p>
                <p className='whitespace-nowrap'>{getTractor?.vehicle_info?.vehicle_name || ''}</p>
              </div>
            </div>
            <div className='flex flex-col flex-1'>
              <p className='font-bold mb-1'>トレーラ</p>
              <div className='flex flex-wrap flex-1 gap-2'>
                {getTrailer[0] ? (
                  <div className='min-h-28 flex-1 border border-gray-item rounded-lg p-2'>
                    {trailer1Stt && <Status data={trailer1Stt} type={false} />}
                    <div className='flex items-center'>
                      <div className='border-r-1 border-gray-item pr-2'>
                        <p className='whitespace-nowrap'>{`${getTrailer[0]?.vehicle_info?.registration_area_code || ''} ${getTrailer[0]?.vehicle_info?.registration_group_number || ''} ${getTrailer[0]?.vehicle_info?.registration_character || ''} ${getTrailer[0]?.vehicle_info?.registration_number_1 || ''}`}</p>
                        <p>
                          <span className='mr-2'>{getTrailer[0]?.vehicle_info?.vehicle_name || ''}</span>
                          {(getTrailer[0]?.vehicle_info?.temperature_range || []).map((value) => (
                            <span key={value} className='mr-2'>
                              {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className='text-black pl-2 font-normal'>
                        <div className='flex flex-wrap space-x-2'>
                          <p className='font-bold whitespace-nowrap'>運賃</p>
                          <p className='whitespace-nowrap'>{`¥ ${handleFormatNumberToCurrency(getItemTrailer(getTrailer[0]?.id || 0)?.price || 0) || ''}`}</p>
                        </div>
                        <div className='flex flex-wrap space-x-2'>
                          <p className='font-bold whitespace-nowrap'>カットオフ</p>
                          <p className='whitespace-nowrap'>{dataItem?.cutoff_time || '00:00'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <React.Fragment />
                )}
                {getTrailer[1] ? (
                  <div className='min-h-28 flex-1 border border-gray-item rounded-lg p-2'>
                    {trailer2Stt && <Status data={trailer2Stt} type={false} />}
                    <div className='flex items-center'>
                      <div className='border-r-1 border-gray-item pr-2'>
                        <p className='whitespace-nowrap'>{`${getTrailer[1]?.vehicle_info?.registration_area_code || ''} ${getTrailer[1]?.vehicle_info?.registration_group_number || ''} ${getTrailer[1]?.vehicle_info?.registration_character || ''} ${getTrailer[1]?.vehicle_info?.registration_number_1 || ''}`}</p>
                        <p>
                          <span className='mr-2'>{getTrailer[1]?.vehicle_info?.vehicle_name || ''}</span>
                          {(getTrailer[1]?.vehicle_info?.temperature_range || []).map((value) => (
                            <span key={value} className='mr-2'>
                              {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className='pl-2 text-black font-normal'>
                        <div className='flex space-x-3'>
                          <p className='font-bold whitespace-nowrap'>運賃</p>
                          <p className='whitespace-nowrap'>{`¥ ${handleFormatNumberToCurrency(getItemTrailer(getTrailer[1]?.id || 0)?.price || 0) || ''}`}</p>
                        </div>
                        <div className='flex space-x-3'>
                          <p className='font-bold whitespace-nowrap'>カットオフ</p>
                          <p className='whitespace-nowrap'>{dataItem?.cutoff_time || '00:00'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex-1' />
                )}
              </div>
            </div>

            <div className='flex items-end'>
              <Button
                radius='sm'
                color='primary'
                onPress={() => onUpdateOpenDetail(true, dataItem.id)}
                className='h-12 px-4 text-base font-bold leading-6'
              >
                詳細を見る
              </Button>
            </div>
          </div>
        </>
      ) : (
        <React.Fragment />
      )}
    </div>
  );

  let viewItem = <React.Fragment />;
  switch (dataItem?.status) {
    case 0:
    case null:
      // 0: Khởi tạo,
      viewItem = showContentInitialization;
      break;
    case 1:
    case 2:
      // 1: Chờ chạy,
      // 2: Đang chạy
      viewItem = inProgress;
      break;
    case 3:
      // 3: completed,
      viewItem = (
        <div className='rounded-lg border border-other-gray p-3 flex flex-col mt-4 text-center text-base font-bold'>
          completed
        </div>
      );
      break;
    case 4:
      // 4: cancel
      viewItem = (
        <div className='rounded-lg border border-other-gray p-3 flex flex-col mt-4 text-center text-base font-bold'>
          cancel
        </div>
      );
      break;
    default:
      break;
  }

  return <>{viewItem}</>;
}

export default FlightItem;
