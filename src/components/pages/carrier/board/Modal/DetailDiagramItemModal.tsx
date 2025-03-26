'use client';
import { Button, Spinner } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { CmnTabs } from '@/components/common/CmnTabs';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import Status from '@/components/pages/carrier/board/Status';
import { TransType, VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { Matching, MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatCutOffTime } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType } from '@/types/app';
import { ITrailer, ITransportMatching } from '@/types/carrier/transport';
import { DataFlightListItem, dataPrivate } from '@/types/schedule';

import DeleteFlight from '../../schedule-list/flight-list/DeleteFlight';
import FreightAdjustment from '../../schedule-list/flight-list/FreightAdjustment';
import OperationDateTime from '../../schedule-list/flight-list/OperationDateTime';
import VehicleAllocation from '../../schedule-list/flight-list/VehicleAllocation';

const fetchData = async ({ id, binName, transportDate }: { id: number; binName?: string; transportDate?: string }) => {
  const userToken = getCookie(KEY_COOKIE_TOKEN);
  const scheduleCarrierApi = scheduleCarrierService(userToken as string);
  return await scheduleCarrierApi.getDetailFlight(id, binName, transportDate);
};

const updatePrivate = async ({ id, data }: { id: number; data: dataPrivate }) => {
  const userToken = getCookie(KEY_COOKIE_TOKEN);
  const scheduleCarrierApi = scheduleCarrierService(userToken as string);
  return await scheduleCarrierApi.updatePrivate(id, data);
};

interface DetailDiagramItemModalProps {
  item: ITransportMatching;
  isOpen: boolean;
  onClose: () => void;
  onRequest?: (trailer: ITrailer) => void;
}

function DetailDiagramItemModal(props: DetailDiagramItemModalProps) {
  const { item, isOpen = false, onClose = () => null, onRequest } = props;

  const { truck, trailer_1, trailer_2 } = item;
  // Sort trailers by display_order and assign to array
  const trailers = [trailer_1, trailer_2].sort(
    (a, b) =>
      Number(!a.trailer_license_plt_num_id) - Number(!b.trailer_license_plt_num_id) ||
      Number(a.display_order) - Number(b.display_order),
  );

  const router = useRouter();
  const dispatch = useAppDispatch();
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const [loading, setLoading] = useState(true);
  const [idTrailer, setIdTrailer] = useState<number>();
  const [openVehicle, setOpenVehicle] = useState(false);
  const [openFreight, setOpenFreight] = useState(false);
  const [openDateTime, setOpenDateTime] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [dataFlight, setDataFlight] = useState<DataFlightListItem>();
  const [loadingFlightInformation, setLoadingFlightInformation] = useState(false);

  useEffect(() => {
    fetchData({
      id: Number(item.trailer_1.vehicle_diagram_item_id || 99999),
      binName: item.service_name,
      transportDate: item.service_strt_date,
    })
      .then((response: DataFlightListItem) => {
        setDataFlight(response);
        const listAllocationTrailer = (response?.vehicle_diagram_allocations || []).filter(
          (data) => data?.vehicle_type === VEHICLE_TYPE.TRAILER,
        );
        listAllocationTrailer?.length && setIdTrailer(listAllocationTrailer[0].id || 0);
      })
      .catch((error) => {
        onClose();
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
        console.log('[ERROR] = flightDetail:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUpdateIdTrailer = (id: number) => {
    setIdTrailer(id);
  };

  const handleUpdateDataFlight = useCallback((data: DataFlightListItem) => {
    setDataFlight(data);
    router.refresh();
  }, []);

  const getMobitiHubStartTime = () => {
    if (dataFlight?.departure_time) {
      // mobiti hub = departure_time - 10 minutes
      const cutoffTrailer1 = item.trailer_1.cut_off_time ? Number(item.trailer_1.cut_off_time) : 0;
      const cutoffTrailer2 = item.trailer_2.cut_off_time ? Number(item.trailer_2.cut_off_time) : 0;
      //cutoffTime  = max of cutoffTrailer1, cutoffTrailer2
      const cutoffTime = Math.max(cutoffTrailer1, cutoffTrailer2);

      const mobitiHubStartTime = dayjs(dataFlight?.departure_time, 'HH:mm')
        .subtract(cutoffTime * 60, 'minutes')
        .format('HH:mm');
      const mobitiHubEndTime = dayjs(dataFlight?.departure_time, 'HH:mm').add(15, 'minutes').format('HH:mm');
      return `${mobitiHubStartTime}-${mobitiHubEndTime}`;
    }
    return '';
  };

  const getMobitiHubEndTime = () => {
    if (dataFlight?.arrival_time) {
      const mobitiHubStartTime = dayjs(dataFlight?.arrival_time, 'HH:mm').subtract(15, 'minutes').format('HH:mm');
      const mobitiHubEndTime = dayjs(dataFlight?.arrival_time, 'HH:mm')
        .add(3 * 60, 'minutes')
        .format('HH:mm');
      return `${mobitiHubStartTime}-${mobitiHubEndTime}`;
    }
    return '';
  };

  const getBtnLabel = (trailer: any) => {
    if (trailer?.order_status) {
      return '取引詳細を見る';
    } else if (trailer?.matching_status) {
      return 'マッチング結果を見る';
    }

    return '';
  };

  const tabVehicle = useMemo(() => {
    return trailers
      .filter((trailer) => trailer?.trailer_license_plt_num_id)
      .map((trailer, index) => ({
        key: trailer!.trailer_license_plt_num_id + '' + index,
        title: `${trailer!.trailer_license_plt_num_id} ${trailer!.vehicle_name || ''}`,
        content: (
          <div>
            <div className='flex items-center'>
              <p className='text-black font-bold text-base leading-7 w-40'>運賃</p>
              <p>{handleFormatNumberToCurrency(Number(trailer.price) || 0) || ''} 円</p>
            </div>

            <p className='text-black font-bold text-base leading-7 '>カットオフ運賃</p>
            <div className='flex items-center mt-3'>
              <p className='text-black font-bold text-base leading-7 !w-40'>
                {formatCutOffTime(Number(trailer.cut_off_time))}
              </p>
              <p>{handleFormatNumberToCurrency(Number(trailer.cut_off_fee) ? Number(trailer.cut_off_fee) : 0)} 円</p>
            </div>
          </div>
        ),
      }));
  }, [trailer_1, trailer_2]);

  const handleUpdateFlightInformation = async () => {
    const showError = () => {
      onClose();
      dispatch(
        actions.appAction.showNotification({
          type: ENotificationType.ERROR,
          title: gTxt('MESSAGES.FAILED'),
          content: gTxt('MESSAGES.FAILED'),
        }),
      );
    };
    const trailerIds = (dataFlight?.vehicle_diagram_item_trailer || [])?.map((item) => item.id) || [];
    if (trailerIds?.length) {
      const isPrivate = dataFlight?.is_private === true ? false : true;
      setLoadingFlightInformation(true);
      updatePrivate({
        id: Number(item.trailer_1.vehicle_diagram_item_id || 99999),
        data: {
          vehicle_diagram_item_trailer_id: trailerIds,
          is_private: isPrivate,
        },
      })
        .then((response) => {
          if (response && response?.status && response?.status !== 200) {
            showError();
          } else {
            setDataFlight((old) => ({ ...old, is_private: isPrivate }) as DataFlightListItem);
          }
        })
        .catch((error) => {
          showError();
          console.log('[ERROR] === updatePrivate ======>:', error);
        })
        .finally(() => setLoadingFlightInformation(false));
    }
  };

  const renderTrailerInfo = (trailer?: ITrailer, index?: number) =>
    trailer?.trailer_license_plt_num_id && (
      <div
        className='grid grid-cols-8 items-start text-base leading-7 gap-x-2'
        key={`${index || 0}_${trailer.order_id}_${trailer.vehicle_avb_resource_id}`}
      >
        <div className='col-span-2'>
          <span>{`${trailer.trailer_license_plt_num_id} ${trailer.vehicle_name || ''}`}</span>
        </div>
        <div className='col-span-2'>
          <span>予約スペース:21453354856</span>
        </div>
        <div className='col-span-4'></div>
      </div>
    );

  return (
    <>
      <CmnModal size='5xl' isOpen={isOpen} onClose={onClose}>
        <CmnModalHeader
          title={
            !loading && (
              <div className='flex justify-between'>
                <p>
                  便詳細 - {dataFlight?.day ? dayjs(dataFlight?.day).locale('ja').format('YYYY年MM月DD日(ddd)') : ''}{' '}
                  {dataFlight?.trip_name || ''}
                </p>
                <Button
                  radius='sm'
                  onPress={() => setOpenModalDelete(true)}
                  className='h-12 px-4 text-base font-bold leading-6 border-error border-1 bg-white text-error'
                >
                  運行スケジュール削除
                </Button>
              </div>
            )
          }
          description={loading ? '' : '登録されている便の詳細です。'}
        />
        <CmnModalBody>
          {loading ? (
            <div className='py-48 flex justify-center'>
              <Spinner color='primary' size='lg' />
            </div>
          ) : (
            <div className='text-base font-normal leading-7'>
              <div>
                <div className='flex flex-wrap items-start mt-2'>
                  <div>
                    {truck && (
                      <div className='mr-6'>
                        <p className='font-bold'>トラクター</p>
                        <div className='min-w-40 min-h-28 border border-gray-item rounded-lg px-4 py-5'>
                          <p>{`${truck?.car_license_plt_num_id || ''}`}</p>
                          <p>{truck?.vehicle_name || ''}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='flex-1'>
                    <p className='font-bold'>トレーラ</p>
                    <div className='flex flex-wrap gap-y-3'>
                      {trailers.map((t, index) => {
                        const trailerStt = MatchingHelper.getTrailerStatus(t);
                        return t.trailer_license_plt_num_id ? (
                          <div
                            key={`${t.trip_name}_${index}`}
                            className='min-h-28 flex-1 border border-gray-item rounded-lg p-2 mr-2'
                          >
                            {trailerStt && (
                              <div className='flex gap-1'>
                                <Status data={trailerStt} type={t.trans_type === TransType.CARRIER} />
                              </div>
                            )}
                            <div className='flex items-center'>
                              <div className='mr-4'>
                                <p>{t.trailer_license_plt_num_id || ''}</p>
                                <p>
                                  <span className='mr-2'>{t.vehicle_name || ''}</span>
                                  {getCondition(t.temperature_range)}
                                </p>
                              </div>
                              <div className='flex items-center gap-2'>
                                <p className='text-black font-bold'>運賃</p>
                                <p>{currencyFormatWithIcon(Number(t.price) + Number(t.cut_off_fee))}</p>
                              </div>
                            </div>
                            {getBtnLabel(t) && trailerStt?.status !== Matching.NOT_MATCH && (
                              <Button
                                color='primary'
                                onPress={() => onRequest && onRequest(t)}
                                className='h-12 mt-2 px-4 rounded-lg text-white text-base font-bold leading-6'
                              >
                                {getBtnLabel(t)}
                              </Button>
                            )}
                          </div>
                        ) : (
                          <React.Fragment />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {dataFlight ? (
                <div className='mt-4 border border-other-gray rounded-lg p-6'>
                  <div className='relative'>
                    <div className='flex items-center'>
                      <p className='!w-36 text-black font-bold text-base leading-7'>便名</p>
                      <p>{dataFlight?.trip_name || ''}</p>
                    </div>
                    <div className='flex items-center mt-3'>
                      <p className='!w-36 text-black font-bold text-base leading-7'>区間</p>
                      <p>
                        {dataFlight?.departure_from && dataFlight?.arrival_to
                          ? `${getPrefectureName(regions, dataFlight?.departure_from)} ～ ${getPrefectureName(regions, dataFlight?.arrival_to)}`
                          : ((dataFlight?.departure_from || dataFlight?.arrival_to) &&
                              getPrefectureName(regions, dataFlight?.departure_from || dataFlight?.arrival_to)) ||
                            ''}
                      </p>
                    </div>
                    <div className='flex items-center mt-3'>
                      <p className='!w-36 text-black font-bold text-base leading-7'>運行時間</p>
                      <p>
                        出発時刻{' '}
                        {dataFlight?.departure_time
                          ? dayjs(dataFlight?.departure_time, TIME_FORMAT.HHMM).format(TIME_FORMAT.HH_MM)
                          : '00:00'}{' '}
                        ～ 到着時刻{' '}
                        {dataFlight?.arrival_time
                          ? dayjs(dataFlight?.arrival_time, TIME_FORMAT.HHMM).format(TIME_FORMAT.HH_MM)
                          : '00:00'}
                      </p>
                    </div>
                    <div className='flex items-center mt-3'>
                      <p className='!w-36 text-black font-bold text-base leading-7'>運行日時</p>
                      <p>{dataFlight?.day ? dayjs(dataFlight?.day).locale('ja').format('YYYY年MM月DD日(ddd)') : ''}</p>
                    </div>
                    <div className='absolute top-0 right-1'>
                      <div className='flex items-center'>
                        <p className='text-black font-bold text-base leading-7'>ID:</p>
                        <p>{dataFlight.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end'>
                    <Button
                      radius='sm'
                      color='primary'
                      onPress={() => setOpenDateTime(true)}
                      className='h-12 px-4 mt-3 text-base font-bold leading-6'
                    >
                      運行日時修正
                    </Button>
                  </div>
                </div>
              ) : (
                <React.Fragment />
              )}
              <div className='mt-4 border border-other-gray rounded-lg p-6'>
                <div className='flex flex-wrap items-center gap-y-2'>
                  <p className='!w-36 whitespace-nowrap text-black font-bold text-base leading-7'>割り当て車両</p>

                  <div className='flex items-stretch'>
                    {truck && (
                      <div className='mr-3'>
                        <div className='w-[6.438rem] h-8 bg-[#555555] rounded-lg flex items-center justify-center'>
                          <p className='text-white text-base leading-6 font-bold'>
                            {gTxt('COMMON.VEHICLE_TYPE_TRACTOR')}
                          </p>
                        </div>
                        <div className='border border-gray-item rounded-lg p-2 mt-1 min-w-[7.563rem] min-h-[5.25rem]'>
                          <p>{`${truck?.car_license_plt_num_id || ''}`}</p>
                          <p className='text-black text-sm font-bold leading-[1.313rem]'>{truck?.vehicle_name || ''}</p>
                        </div>
                      </div>
                    )}
                    {trailers.map((t, _index) => {
                      return (
                        t.trailer_license_plt_num_id && (
                          <div className='mr-3' key={`${_index}_${t.trip_name}`}>
                            <div className='w-[6.438rem] h-8 bg-[#555555] rounded-lg flex items-center justify-center'>
                              <p className='text-white text-base leading-6 font-bold'>
                                {gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                              </p>
                            </div>
                            <div className='border border-gray-item rounded-lg p-2 mt-1 min-w-[8.5rem] min-h-[5.25rem]'>
                              <p>{`${t.trailer_license_plt_num_id || ''}`}</p>
                              <p className='text-black text-sm font-bold leading-[1.313rem]'>
                                <span className='mr-2'>
                                  {t.vehicle_name || ''}
                                  {getCondition(t.temperature_range)}
                                </span>
                              </p>
                            </div>
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>

                {(trailer_1 && trailer_1.trailer_license_plt_num_id) ||
                (trailer_2 && trailer_2.trailer_license_plt_num_id) ? (
                  <div className='flex justify-end'>
                    <Button
                      radius='sm'
                      color='primary'
                      onPress={() => setOpenVehicle(true)}
                      className='h-12 px-4 mt-3 text-base font-bold leading-6'
                    >
                      車両割り当て修正
                    </Button>
                  </div>
                ) : (
                  <React.Fragment />
                )}
              </div>

              <div className='mt-4 border border-other-gray rounded-lg p-6'>
                <div className='flex flex-wrap items-center'>
                  <p className='text-black font-bold text-base leading-7 w-40'>車両別運賃選択</p>
                  <CmnTabs onSelectionChange={(key) => handleUpdateIdTrailer(Number(key))} items={tabVehicle} />
                </div>
              </div>

              <div className='mt-4 p-6 border rounded-lg border-other-gray'>
                <p className='text-[1.75rem] leading-[2.625rem] font-normal'>モビリティハブ情報</p>
                <div className='flex flex-col space-y-2'>
                  <div className='grid grid-cols-8 items-start font-bold text-base leading-7 gap-x-2'>
                    <div className='col-span-2'>
                      <span>
                        {dataFlight?.departure_from ? getPrefectureName(regions, dataFlight?.departure_from) : ''}
                      </span>
                    </div>
                    <div className='col-span-2'>
                      <span>予約ステータス : 完了</span>
                    </div>
                    <div className='col-span-4'>
                      {`予約日時 : ${dataFlight?.day ? dayjs(dataFlight?.day).locale('ja').format(DATE_FORMAT.JAPANESE) : ''}${getMobitiHubStartTime()}`}
                    </div>
                  </div>
                  {trailers.map((trailer, index) => {
                    return renderTrailerInfo(trailer, index);
                  })}
                </div>
                <div className='mt-4 flex flex-col space-y-2'>
                  <div className='grid grid-cols-8 font-bold text-base leading-7 gap-2'>
                    <div className='col-span-2'>
                      <span>{dataFlight?.arrival_to ? getPrefectureName(regions, dataFlight?.arrival_to) : ''}</span>
                    </div>
                    <div className='col-span-2'>
                      <span>予約ステータス : 完了</span>
                    </div>
                    <div className='col-span-4'>
                      {`予約日時 : ${dataFlight?.day ? dayjs(dataFlight?.day).locale('ja').format(DATE_FORMAT.JAPANESE) : ''}${getMobitiHubEndTime()}`}
                    </div>
                  </div>
                  {trailers.map((trailer, index) => {
                    return renderTrailerInfo(trailer, index);
                  })}
                </div>
              </div>
            </div>
          )}
        </CmnModalBody>
        {!loading && (
          <CmnModalFooter
            buttonLeftFirst={{
              children: '閉じる',
              onPress: onClose,
              className: 'border-1 text-base font-bold px-4 border-none bg-background',
            }}
            buttonRightFirst={{
              isLoading: loadingFlightInformation,
              onPress: handleUpdateFlightInformation,
              className: 'text-base font-bold px-4',
              children: dataFlight?.is_private ? '運行便情報公開' : '運行便情報非公開',
            }}
          />
        )}
      </CmnModal>

      {openDateTime && (
        <OperationDateTime
          id={Number(item?.trailer_1.vehicle_diagram_item_id || 0)}
          isOpen={openDateTime}
          onClose={() => setOpenDateTime(false)}
          onUpdateDataFlight={handleUpdateDataFlight}
          dataFlight={dataFlight as DataFlightListItem}
        />
      )}

      {openVehicle && (
        <VehicleAllocation
          id={Number(item.trailer_1.vehicle_diagram_item_id || 0)}
          isOpen={openVehicle}
          onClose={() => setOpenVehicle(false)}
          onUpdateDataFlight={handleUpdateDataFlight}
          dataFlight={dataFlight as DataFlightListItem}
        />
      )}

      {openFreight && (
        <FreightAdjustment
          id={Number(item?.trailer_1.vehicle_diagram_item_id || 0)}
          isOpen={openFreight}
          onClose={() => setOpenFreight(false)}
          idTrailer={Number(trailers[0]?.trailer_license_plt_num_id || 0)}
          dataFlight={dataFlight as DataFlightListItem}
        />
      )}

      <DeleteFlight
        id={Number(item?.trailer_1.vehicle_diagram_item_id || 0)}
        isOpen={openModalDelete}
        onCloneFather={onClose}
        onClose={() => setOpenModalDelete(false)}
      />
    </>
  );
}

export default memo(DetailDiagramItemModal);
