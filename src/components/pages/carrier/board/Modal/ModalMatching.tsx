'use client';

import { Button, Skeleton } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TransType, VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { OUT_PACKAGES } from '@/constants/shipper';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { cn, currencyFormatWithIcon, formatCurrency, formatTime } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { RootState } from '@/redux/store';
import { transactionService } from '@/services/transaction/transaction';
import { transportService } from '@/services/transaction/transport';
import { IMatchingItem, ITrailer } from '@/types/carrier/transport';

interface ModalMatchingProps {
  isOpen: boolean;
  trailer: ITrailer;
  onClose: () => void;
  onViewCompanyInfo: (id: string, role: string) => void;
  onSubmit: (item: IMatchingItem) => void;
}

const ModalMatching = (props: ModalMatchingProps) => {
  const { isOpen, trailer, onClose, onViewCompanyInfo, onSubmit } = props;
  const regions = useAppSelector((state: RootState) => state.app.locations);
  const [matchingData, setMatchingData] = useState<any[]>([]);
  const [trailerData, setTrailerData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const transactionApi = transactionService();

  const transportApi = transportService();

  const fetData = async (id: string) => {
    setIsLoading(true);
    transportApi
      .apiAth013(id)
      .then((response) => {
        setMatchingData(response?.matching_list);
        setTrailerData(response?.trailer);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onCreateMatching = async (payload: IMatchingItem, trailer: any) => {
    const params = {
      cns_line_item_by_date_id: payload?.id || 1,
      vehicle_avb_resource_item_id: payload.vehicle_avb_resource_item_id || 1,
      service_no: trailer.service_no,
      departure_date: dayjs(trailer.service_strt_date).format(DATE_FORMAT.YYYYMMDD),
      departure_time: dayjs(trailer.service_strt_time, TIME_FORMAT.HH_MM_SS).format(TIME_FORMAT.HHMM),
      arrival_date: dayjs(trailer.service_end_date).format(DATE_FORMAT.YYYYMMDD),
      arrival_time: dayjs(trailer.service_end_time, TIME_FORMAT.HH_MM_SS).format(TIME_FORMAT.HHMM),
      giai: trailer.giai,
      price: payload?.price_per_unit,
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
      matching_id: payload?.matching_id || 1,
    };

    try {
      const responseCarrier = await (payload.trans_type === TransType.SHIPPER
        ? transactionApi.apiAth021({ id: payload.matching_id })
        : transactionApi.apiAth3061(params));

      const createdId =
        'data' in responseCarrier
          ? responseCarrier.data.id
          : 'propose_id' in responseCarrier
            ? responseCarrier.propose_id
            : undefined;

      if (createdId) {
        onSubmit(payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetData(trailer?.vehicle_avb_resource_id);
    return () => {
      setMatchingData([]);
    };
  }, [isOpen === true]);

  const renderSkeleton = () => {
    const skeletonCount = trailer?.total_count || 1;
    return Array.from({ length: +skeletonCount }).map((_, index) => (
      <div key={index} className='bg-white border border-other-gray rounded-lg text-sm p-2'>
        <div className='h-7 flex items-center gap-2 mb-2 justify-end'>
          <Skeleton className='w-44 h-6 rounded-lg' />
        </div>
        <div className='flex items-center py-1 gap-2 mt-4'>
          <Skeleton className='w-72 h-10 rounded' />
          <Skeleton className='w-40 h-8 rounded' />
          <Skeleton className='w-40 h-8 rounded' />
          <Skeleton className='w-40 h-8 rounded' />
        </div>
        <div className='flex justify-between py-1 gap-2'>
          <div className='flex items-center gap-2 py-1'>
            <Skeleton className='w-40 h-8 rounded' />
            <Skeleton className='w-64 h-8 rounded' />
            <Skeleton className='w-24 h-8 rounded' />
            <Skeleton className='w-40 h-8 rounded' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='rounded-lg text-base text-white w-[9.6875rem] h-10' />
            <Skeleton className='rounded-lg text-base text-white w-[9.6875rem] h-10' />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <CmnModal isOpen={isOpen} onClose={onClose} size='custom' customSize={{ width: '1280px', marginTop: '68px' }}>
        <CmnModalHeader
          title={`マッチング${trailer?.total_count || 0}件 - ${dayjs(trailerData?.service_strt_date).format(DATE_FORMAT.JAPANESE) || ''}  ${trailerData?.service_name || ''}`}
        />
        <CmnModalBody classNames='py-3'>
          <p className='text-xs pb-6'>
            {trailerData &&
              `${dayjs(trailerData.service_strt_date).format(DATE_FORMAT.JAPANESE) || ''}
              ${trailerData.service_name || ''}
              ${trailerData.car_ctrl_num_id || ''}
              トレクス トレーラにマッチングした荷物の詳細です。`}
          </p>
          {isLoading && renderSkeleton()}
          {matchingData &&
            matchingData.map((item: IMatchingItem, index: any) => (
              <div key={index + 1} className='bg-white border border-other-gray rounded-lg text-sm p-2'>
                <div
                  className={cn(
                    'h-7 flex items-center gap-2 mb-2',
                    item.trans_type === TransType.CARRIER ? 'justify-between' : 'justify-end',
                  )}
                >
                  {item.trans_type === TransType.CARRIER && (
                    <div className='w-[6.25rem] h-8 px-2 py-2 bg-other-gray rounded-lg justify-center items-center gap-2 inline-flex'>
                      <div className='text-center text-[#f2f2f2] text-base font-bold leading-normal'>キャリア間</div>
                    </div>
                  )}
                  <div className='flex items-center'>
                    <div className='w-12 h-5 text-sm font-bold leading-tight'>輸送日</div>
                    <div className='text-sm font-normal leading-tight'>
                      {item.collection_date ? dayjs(item.collection_date).format(DATE_FORMAT.JAPANESE) : ''}
                    </div>
                  </div>
                </div>
                {item.trans_type === TransType.CARRIER && item.parent_order_propose_snapshot && (
                  <>
                    <div className='py-1 justify-start items-center gap-2 flex flex-row flex-wrap'>
                      <div className='items-center gap-2 flex'>
                        <div className='text-base font-bold leading-7'>マッチ日</div>
                        <div className='text-2xl font-medium leading-9'>
                          {item.created_at ? dayjs(item.created_at).format(DATE_FORMAT.JAPANESE) : ''}
                        </div>
                      </div>
                      <div className='justify-start items-center gap-2 flex'>
                        <div className='text-base font-bold leading-7'>便名</div>
                        <div className='text-2xl font-medium leading-9'>
                          {item.parent_order_propose_snapshot?.trip_name}
                        </div>
                      </div>
                      <div className='px-3 rounded-lg border border-[#d9d9d9] justify-start items-center flex'>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>出発</div>
                          <div className='text-2xl font-medium leading-9'>
                            {`${getPrefectureName(regions, item.departure_from)} ${
                              item.collection_time_from
                                ? formatTime(item.collection_time_from, TIME_FORMAT.HH_MM_SS) + '発'
                                : ''
                            }`}
                          </div>
                          <Icon icon='keyboard_arrow_right' size={24} />
                          <div className='text-base font-bold leading-7'>到着</div>
                          <div className='text-2xl font-medium leading-9'>
                            {`${getPrefectureName(regions, item.arrival_to)} ${
                              item.collection_time_to
                                ? formatTime(item.collection_time_to, TIME_FORMAT.HH_MM_SS) + '発'
                                : ''
                            }`}
                          </div>
                        </div>
                      </div>
                      <div className='justify-start items-center gap-2 flex'>
                        <div className='text-center text-base font-bold leading-7'>運賃</div>
                        <div className='text-center text-[#1e1e1e] text-2xl font-medium leading-9'>
                          ¥ {item?.price_per_unit ? formatCurrency(`${item?.price_per_unit}`) : ''}
                        </div>
                      </div>
                    </div>
                    <div className='flex justify-between'>
                      <div className='py-1 justify-start items-center gap-4 flex flex-wrap flex-row'>
                        <div className='justify-start items-center gap-2 flex'>
                          <div className='text-base font-bold leading-7'>運送会社</div>
                          <div className='text-2xl font-medium leading-9'>{item?.operator_name}</div>
                        </div>
                        <div className='px-3 rounded-lg border border-[#d9d9d9] justify-start items-center flex'>
                          <div className='justify-start items-center gap-2 flex'>
                            <div className='text-base font-bold leading-7'>車両</div>
                            <div className='text-2xl font-medium leading-9'>
                              {item.parent_order_propose_snapshot.vehicle_name}
                            </div>
                          </div>
                          <div className='justify-start items-center gap-2 flex'>
                            <div className='text-base font-bold leading-7'>タイプ</div>
                            <div className='text-2xl font-medium leading-9'>
                              {item.parent_order_propose_snapshot.vehicle_type == VEHICLE_TYPE.TRACTOR
                                ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                                : gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                            </div>
                          </div>
                          <div className='justify-start items-center gap-2 flex'>
                            <div className='text-base font-bold leading-7'>温度帯</div>
                            <div className='text-2xl font-medium leading-9'>
                              {item?.temperature_range ? getCondition(item?.temperature_range) : ''}
                            </div>
                          </div>
                          <div className='justify-start items-center gap-4 flex'>
                            <div className='text-base font-bold leading-7'>車両ナンバー</div>
                            <div className='text-2xl font-medium leading-9'>
                              {item?.trailer_license_plt_num_id ?? ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex justify-end items-start gap-2'>
                        <div className='self-stretch justify-end items-center inline-flex'>
                          <div className='flex-col justify-end items-end gap-2.5 inline-flex'>
                            <div className='justify-end items-end gap-2 inline-flex'>
                              <Button
                                color='primary'
                                size='md'
                                className='rounded-lg text-base'
                                onPress={() =>
                                  onViewCompanyInfo(item.parent_order_propose_snapshot.operator_id, 'carrier')
                                }
                              >
                                運送会社情報を見る
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className='flex items-center py-1 gap-2 mt-1'>
                  <div className='flex items-center px-2 py-1 gap-2 border border-default rounded-lg'>
                    <p className='text-base font-bold'>運送区間</p>
                    <p className='text-2xl font-medium'>{getPrefectureName(regions, +item.departure_from) ?? '----'}</p>
                    <Icon icon='keyboard_arrow_right' size={24} />
                    <p className='text-2xl font-medium'>{getPrefectureName(regions, +item.arrival_to) ?? '----'}</p>
                  </div>
                  <div className='flex items-center px-2 py-1 gap-2'>
                    <p className='text-base font-bold'>希望持ち込み時間</p>
                    <p className='text-2xl font-medium'>
                      {item.collection_time_from
                        ? dayjs(item?.collection_time_from, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)
                        : '--:--'}
                      -
                      {item.collection_time_to
                        ? dayjs(item?.collection_time_to, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)
                        : '--:--'}
                    </p>
                  </div>
                  <div className='flex items-center px-2 py-1 gap-2'>
                    <p className='text-base font-bold'>希望運賃</p>
                    <p className='text-2xl font-medium'>
                      {item.price_per_unit && currencyFormatWithIcon(item.price_per_unit)}
                    </p>
                  </div>
                </div>
                <div className='flex justify-between py-1 gap-2'>
                  <div className='flex items-center'>
                    <div className='flex items-center px-2 py-1 gap-2'>
                      <p className='text-base font-bold'>荷主</p>
                      <p className='text-2xl font-medium'>{item.shipper_operator_name}</p>
                    </div>
                    <div className='flex items-center px-2 py-1 gap-2'>
                      <p className='text-base font-bold'>品名</p>
                      <p className='text-2xl font-medium'>{item?.transport_name}</p>
                    </div>
                    <div className='flex items-center px-2 py-1 gap-2'>
                      <p className='text-base font-bold'>品目</p>
                      <p className='text-2xl font-medium'>
                        {item?.outer_package_code
                          ? OUT_PACKAGES.find((op) => op.key === item?.outer_package_code?.toString())?.label
                          : ''}
                      </p>
                    </div>
                    <div className='flex items-center px-2 py-1 gap-2'>
                      <p className='text-base font-bold'>温度帯</p>
                      <p className='text-2xl font-medium'>
                        {item?.temperature_range ? getCondition(item?.temperature_range) : ''}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      color='primary'
                      size='md'
                      className='rounded-lg text-base w-[9.6875rem]'
                      onPress={() =>
                        onViewCompanyInfo(
                          item.trans_type === TransType.CARRIER ? item.shipper_operator_id : item.operator_id,
                          'shipper',
                        )
                      }
                    >
                      会社情報を見る
                    </Button>
                    <Button
                      color='primary'
                      size='md'
                      className='rounded-lg text-base w-[9.6875rem]'
                      onPress={() => onCreateMatching(item, trailerData)}
                    >
                      運行を提案する
                    </Button>
                  </div>
                </div>
              </div>
            ))}
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            onPress: onClose,
            className: 'border-1 text-base font-bold px-4 border-none bg-background',
          }}
          classNames='py-3'
        />
      </CmnModal>
    </>
  );
};

export default ModalMatching;
