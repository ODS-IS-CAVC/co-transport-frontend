'use client';
import { Button, Spinner } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useEffect, useState } from 'react';

import { CmnTabs } from '@/components/common/CmnTabs';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import Status from '@/components/pages/carrier/board/Status';
import { FILTER_FLIGHT_LIST } from '@/constants/carrier';
import { TEMPERATURE_RANGE, TransType, VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { Matching, MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType } from '@/types/app';
import { DataFlightListItem, dataPrivate, VehicleTripItemTrailer } from '@/types/schedule';

import DeleteFlight from './DeleteFlight';
import FreightAdjustment from './FreightAdjustment';
import OperationDateTime from './OperationDateTime';
import VehicleAllocation from './VehicleAllocation';

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

interface FlightDetailProps {
  id: number;
  binName?: string;
  transportDate?: string;
  isOpen: boolean;
  isSchedule?: boolean;
  onClose: () => void;
  onRequest?: (item: any, trailer?: VehicleTripItemTrailer) => void;
}

function FlightDetail(props: FlightDetailProps) {
  const {
    id,
    binName,
    transportDate,
    isOpen = false,
    isSchedule = false,
    onClose = () => null,
    onRequest = () => null,
  } = props;
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
    fetchData({ id, binName, transportDate })
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

  const getTractor = (dataFlight?.vehicle_diagram_allocations || []).find(
    (data) => data?.vehicle_type === VEHICLE_TYPE.TRACTOR,
  );

  const getTrailer = (dataFlight?.vehicle_diagram_allocations || []).filter(
    (data) => data?.vehicle_type === VEHICLE_TYPE.TRAILER,
  );

  const getItemTrailer = (id: number) => {
    return (dataFlight?.vehicle_diagram_item_trailer || []).find(
      (value) => id === value?.vehicle_diagram_allocation_id,
    );
  };

  const vehicleDiagramItemTrailer = (idAllocation: number) => {
    return (dataFlight?.vehicle_diagram_item_trailer || []).find(
      (data) => data?.vehicle_diagram_allocation_id === idAllocation,
    );
  };

  const handleUpdateIdTrailer = (id: number) => {
    setIdTrailer(id);
  };

  const vehicleDiagram = vehicleDiagramItemTrailer(idTrailer as number);

  const handleUpdateDataFlight = useCallback((data: DataFlightListItem) => {
    setDataFlight(data);
    router.refresh();
  }, []);

  const trailer1 = getItemTrailer(getTrailer[0]?.id || 0);
  const trailer2 = getItemTrailer(getTrailer[1]?.id || 0);

  const trailer1Stt = trailer1 ? MatchingHelper.getTrailerStatus(trailer1 as any) : null;
  const trailer2Stt = trailer2 ? MatchingHelper.getTrailerStatus(trailer2 as any) : null;

  const getBtnLabel = (trailer: any) => {
    if (trailer?.order_status) {
      return '取引詳細を見る';
    } else if (trailer?.matching_status) {
      return '条件の近い荷物を検索';
    }

    return '';
  };

  const getMobitiHubStartTime = () => {
    if (dataFlight && dataFlight?.departure_time) {
      const cutoffTrailer1 = Number(trailer1?.cut_off_time!!);
      const cutoffTrailer2 = Number(trailer2?.cut_off_time!!);
      const cutoffTime = Math.max(cutoffTrailer1, cutoffTrailer2);
      const mobitiHubStartTime = dayjs(dataFlight?.departure_time, TIME_FORMAT.HHMM)
        .subtract(cutoffTime * 60, 'minutes')
        .format(TIME_FORMAT.HH_MM);
      const mobitiHubEndTime = dayjs(dataFlight?.departure_time, TIME_FORMAT.HHMM)
        .add(15, 'minutes')
        .format(TIME_FORMAT.HH_MM);
      return `${mobitiHubStartTime}-${mobitiHubEndTime}`;
    }
    return '';
  };

  const getMobitiHubEndTime = () => {
    if (dataFlight?.arrival_time) {
      const mobitiHubStartTime = dayjs(dataFlight?.arrival_time, TIME_FORMAT.HHMM)
        .subtract(15, 'minutes')
        .format(TIME_FORMAT.HH_MM);
      const mobitiHubEndTime = dayjs(dataFlight?.arrival_time, TIME_FORMAT.HHMM)
        .add(3 * 60, 'minutes')
        .format(TIME_FORMAT.HH_MM);
      return `${mobitiHubStartTime}-${mobitiHubEndTime}`;
    }
    return '';
  };

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
        id,
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

  const isCheckNotUpdate = (dataFlight?.vehicle_diagram_item_trailer || []).some((item) => {
    const validStatuses = FILTER_FLIGHT_LIST[2].value.split(',');
    return validStatuses.includes(String(item?.order_status));
  });

  const setDataCallback = () => {
    return {
      service_strt_date: dayjs(dataFlight?.day).format(DATE_FORMAT.YYYY_MM_DD),
      service_name: dataFlight?.trip_name,
      departure_from: dataFlight?.departure_from,
      departure_to: dataFlight?.arrival_to,
      service_strt_time: dataFlight?.departure_time,
      service_end_time: dataFlight?.arrival_time,
      truck: {
        vehicle_name: getTractor?.vehicle_info?.vehicle_name || '',
        car_license_plt_num_id: `${getTractor?.vehicle_info?.registration_area_code || ''} ${getTractor?.vehicle_info?.registration_group_number || ''} ${getTractor?.vehicle_info?.registration_character || ''} ${getTractor?.vehicle_info?.registration_number_1 || ''}`,
      },
      trailer_1: {
        ...trailer1,
        order_id: trailer1?.trans_order_id,
        matching_status: trailer1?.matching_status || null,
        trailer_license_plt_num_id: `${getTrailer[0]?.vehicle_info?.registration_area_code || ''} ${getTrailer[0]?.vehicle_info?.registration_group_number || ''} ${getTrailer[0]?.vehicle_info?.registration_character || ''} ${getTrailer[0]?.vehicle_info?.registration_number_1 || ''}`,
        temperature_range: getTrailer[0]?.vehicle_info?.temperature_range,
        vehicle_name: getTrailer[0]?.vehicle_info?.vehicle_name,
      },
      trailer_2: {
        ...trailer2,
        order_id: trailer2?.trans_order_id,
        matching_status: trailer2?.matching_status || null,
        trailer_license_plt_num_id: `${getTrailer[1]?.vehicle_info?.registration_area_code || ''} ${getTrailer[1]?.vehicle_info?.registration_group_number || ''} ${getTrailer[1]?.vehicle_info?.registration_character || ''} ${getTrailer[1]?.vehicle_info?.registration_number_1 || ''}`,
        temperature_range: getTrailer[1]?.vehicle_info?.temperature_range,
        vehicle_name: getTrailer[1]?.vehicle_info?.vehicle_name,
      },
    };
  };

  return (
    <>
      <CmnModal size='5xl' isOpen={isOpen} onClose={onClose}>
        <CmnModalHeader
          title={
            loading ? (
              'loading...'
            ) : (
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
                    {getTractor && (
                      <div className='mr-6'>
                        <p className='font-bold'>トラクター</p>
                        <div className='min-w-40 min-h-28 border border-gray-item rounded-lg px-4 py-5'>
                          <p>{`${getTractor?.vehicle_info?.registration_area_code || ''} ${getTractor?.vehicle_info?.registration_group_number || ''} ${getTractor?.vehicle_info?.registration_character || ''} ${getTractor?.vehicle_info?.registration_number_1 || ''}`}</p>
                          <p>{getTractor?.vehicle_info?.vehicle_name || ''}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='flex-1'>
                    <p className='font-bold'>トレーラ</p>
                    <div className='flex flex-wrap gap-y-3'>
                      {getTrailer[0] ? (
                        <div className='min-h-28 flex-1 border border-gray-item rounded-lg p-2 mr-2'>
                          {trailer1Stt && (
                            <Status
                              data={trailer1Stt}
                              type={!isSchedule ? trailer1?.trans_type === TransType.CARRIER : false}
                            />
                          )}
                          <div className='flex items-center'>
                            <div className='mr-4'>
                              <p>{`${getTrailer[0]?.vehicle_info?.registration_area_code || ''} ${getTrailer[0]?.vehicle_info?.registration_group_number || ''} ${getTrailer[0]?.vehicle_info?.registration_character || ''} ${getTrailer[0]?.vehicle_info?.registration_number_1 || ''}`}</p>
                              <p>
                                <span className='mr-2'>{getTrailer[0]?.vehicle_info?.vehicle_name || ''}</span>
                                {(getTrailer[0]?.vehicle_info?.temperature_range || []).map((value) => (
                                  <span key={value} className='mr-2'>
                                    {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                                  </span>
                                ))}
                              </p>
                            </div>
                            <p className='text-black font-bold'>
                              運賃 ¥{' '}
                              {handleFormatNumberToCurrency(
                                isSchedule
                                  ? trailer1?.price || 0
                                  : (trailer1?.price || 0) + (trailer1?.cut_off_fee || 0),
                              ) || ''}
                            </p>
                          </div>
                          {getBtnLabel(trailer1) && trailer1?.status !== Matching.NOT_MATCH && (
                            <Button
                              color='primary'
                              onPress={() => onRequest(setDataCallback(), trailer1)}
                              className='h-12 mt-2 px-4 rounded-lg text-white text-base font-bold leading-6'
                            >
                              {getBtnLabel(trailer1)}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <React.Fragment />
                      )}
                      {getTrailer[1] ? (
                        <div className='min-h-28 flex-1 border border-gray-item rounded-lg p-2 mr-2'>
                          {trailer2Stt && (
                            <Status
                              data={trailer2Stt}
                              type={!isSchedule ? trailer2?.trans_type === TransType.CARRIER : false}
                            />
                          )}
                          <div className='flex items-center'>
                            <div className='mr-4'>
                              <p>{`${getTrailer[1]?.vehicle_info?.registration_area_code || ''} ${getTrailer[1]?.vehicle_info?.registration_group_number || ''} ${getTrailer[1]?.vehicle_info?.registration_character || ''} ${getTrailer[1]?.vehicle_info?.registration_number_1 || ''}`}</p>
                              <p>
                                <span className='mr-2'>{getTrailer[1]?.vehicle_info?.vehicle_name || ''}</span>
                                {(getTrailer[1]?.vehicle_info?.temperature_range || []).map((value) => (
                                  <span key={value} className='mr-2'>
                                    {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                                  </span>
                                ))}
                              </p>
                            </div>
                            <p className='text-black font-bold'>
                              運賃 ¥{' '}
                              {handleFormatNumberToCurrency(
                                isSchedule
                                  ? trailer2?.price || 0
                                  : (trailer2?.price || 0) + (trailer2?.cut_off_fee || 0),
                              ) || ''}
                            </p>
                          </div>
                          {getBtnLabel(trailer2) && trailer2?.status !== Matching.NOT_MATCH && (
                            <Button
                              color='primary'
                              onPress={() => onRequest(setDataCallback(), trailer2)}
                              className='h-12 mt-2 px-4 rounded-lg text-white text-base font-bold leading-6'
                            >
                              {getBtnLabel(trailer2)}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className='flex-1' />
                      )}
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
                      <p>{dataFlight?.day ? dayjs(dataFlight?.day).locale('ja').format(DATE_FORMAT.JAPANESE) : ''}</p>
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
                      isDisabled={isCheckNotUpdate}
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
                    {getTractor && (
                      <div className='mr-3'>
                        <div className='w-[6.438rem] h-8 bg-[#555555] rounded-lg flex items-center justify-center'>
                          <p className='text-white text-base leading-6 font-bold'>
                            {gTxt('COMMON.VEHICLE_TYPE_TRACTOR')}
                          </p>
                        </div>
                        <div className='border border-gray-item rounded-lg p-2 mt-1 min-w-[7.563rem] min-h-[5.25rem]'>
                          <p>{`${getTractor?.vehicle_info?.registration_area_code || ''} ${getTractor?.vehicle_info?.registration_group_number || ''} ${getTractor?.vehicle_info?.registration_character || ''} ${getTractor?.vehicle_info?.registration_number_1 || ''}`}</p>
                          <p className='text-black text-sm font-bold leading-[1.313rem]'>
                            {getTractor?.vehicle_info?.vehicle_name || ''}
                          </p>
                        </div>
                      </div>
                    )}
                    {getTrailer[0] ? (
                      <div className='mr-3'>
                        <div className='w-[6.438rem] h-8 bg-[#555555] rounded-lg flex items-center justify-center'>
                          <p className='text-white text-base leading-6 font-bold'>
                            {gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                          </p>
                        </div>
                        <div className='border border-gray-item rounded-lg p-2 mt-1 min-w-[8.5rem] min-h-[5.25rem]'>
                          <p>{`${getTrailer[0]?.vehicle_info?.registration_area_code || ''} ${getTrailer[0]?.vehicle_info?.registration_group_number || ''} ${getTrailer[0]?.vehicle_info?.registration_character || ''} ${getTrailer[0]?.vehicle_info?.registration_number_1 || ''}`}</p>
                          <p className='text-black text-sm font-bold leading-[1.313rem]'>
                            <span className='mr-2'>
                              {getTrailer[0]?.vehicle_info?.vehicle_name || ''}
                              {(getTrailer[0]?.vehicle_info?.temperature_range || []).map((value) => (
                                <span key={value} className='mr-2'>
                                  {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                                </span>
                              ))}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <React.Fragment />
                    )}

                    {getTrailer[1] ? (
                      <div>
                        <div className='w-[6.438rem] h-8 bg-[#555555] rounded-lg flex items-center justify-center'>
                          <p className='text-white text-base leading-6 font-bold'>
                            {gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                          </p>
                        </div>
                        <div className='border border-gray-item rounded-lg p-2 mt-1 min-w-[8.5rem] min-h-[5.25rem]'>
                          <p>{`${getTrailer[1]?.vehicle_info?.registration_area_code || ''} ${getTrailer[1]?.vehicle_info?.registration_group_number || ''} ${getTrailer[1]?.vehicle_info?.registration_character || ''} ${getTrailer[1]?.vehicle_info?.registration_number_1 || ''}`}</p>
                          <p className='text-black text-sm font-bold leading-[1.313rem]'>
                            <span className='mr-2'>
                              {getTrailer[1]?.vehicle_info?.vehicle_name || ''}
                              {(getTrailer[1]?.vehicle_info?.temperature_range || []).map((value) => (
                                <span key={value} className='mr-2'>
                                  {TEMPERATURE_RANGE[value as keyof typeof TEMPERATURE_RANGE]}
                                </span>
                              ))}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <React.Fragment />
                    )}
                  </div>
                </div>

                {getTrailer?.length ? (
                  <div className='flex justify-end'>
                    <Button
                      radius='sm'
                      color='primary'
                      isDisabled={isCheckNotUpdate}
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
                  <CmnTabs
                    onSelectionChange={(key) => handleUpdateIdTrailer(Number(key))}
                    items={[
                      getTrailer[0] && {
                        key: `${getTrailer[0]?.id}`,
                        title: `${getTrailer[0]?.vehicle_info?.registration_area_code || ''} ${getTrailer[0]?.vehicle_info?.registration_group_number || ''} ${getTrailer[0]?.vehicle_info?.registration_character || ''} ${getTrailer[0]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[0]?.vehicle_info?.vehicle_name || ''}`,
                        content: '',
                      },
                      getTrailer[1] && {
                        key: `${getTrailer[1]?.id}`,
                        title: `${getTrailer[1]?.vehicle_info?.registration_area_code || ''} ${getTrailer[1]?.vehicle_info?.registration_group_number || ''} ${getTrailer[1]?.vehicle_info?.registration_character || ''} ${getTrailer[1]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[1]?.vehicle_info?.vehicle_name || ''}`,
                        content: '',
                      },
                    ]}
                  />
                </div>

                {idTrailer ? (
                  <div>
                    <div className='flex items-center'>
                      <p className='text-black font-bold text-base leading-7 w-40'>運賃</p>
                      <p>{handleFormatNumberToCurrency(getItemTrailer(idTrailer)?.price || 0) || ''} 円</p>
                    </div>

                    <p className='text-black font-bold text-base leading-7 '>カットオフ運賃</p>
                    {Object.entries(vehicleDiagram?.cut_off_price || {}).map(([keyframes, value]) => (
                      <div key={`${keyframes}_${value}`} className='flex items-center mt-3'>
                        <p className='text-black font-bold text-base leading-7 !w-40'>{keyframes}時間前</p>
                        <p>{handleFormatNumberToCurrency(Number(value) ? Number(value) : 0)} 円</p>
                      </div>
                    ))}
                    {(dataFlight?.vehicle_diagram_item_trailer || []).length && (
                      <div className='flex justify-end'>
                        <Button
                          radius='sm'
                          color='primary'
                          isDisabled={isCheckNotUpdate}
                          onPress={() => setOpenFreight(true)}
                          className='h-12 px-4 mt-3 text-base font-bold leading-6'
                        >
                          運賃修正
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <React.Fragment />
                )}
              </div>

              <div className='mt-4 p-6 border rounded-lg border-other-gray'>
                <p className='text-[1.75rem] leading-[2.625rem] font-normal'>モビリティハブ情報</p>
                <div className='flex flex-col space-y-2'>
                  <div className='flex items-center font-bold text-base leading-7'>
                    <div className='w-1/3'>
                      <span>
                        {dataFlight?.departure_from ? getPrefectureName(regions, dataFlight?.departure_from) : ''}
                      </span>
                    </div>
                    <div className='w-1/5'>
                      <span>予約ステータス : 完了</span>
                    </div>
                    <div className='flex-1'>
                      {`予約日時 : ${dataFlight?.day ? dayjs(dataFlight?.day).locale('ja').format(DATE_FORMAT.JAPANESE) : ''}${getMobitiHubStartTime()}`}
                    </div>
                  </div>
                  {(dataFlight?.vehicle_diagram_item_trailer || []).map((value, index) => (
                    <div key={index} className='flex items-center text-base leading-7'>
                      <div className='w-1/3'>
                        <span>
                          {`${getTrailer[index]?.vehicle_info?.registration_area_code || ''} ${getTrailer[index]?.vehicle_info?.registration_group_number || ''} ${getTrailer[index]?.vehicle_info?.registration_character || ''} ${getTrailer[index]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[index]?.vehicle_info?.vehicle_name || ''}`}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <span>{index === 0 ? '予約スペース:21453354856' : '予約スペース:21453354856'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='mt-4 flex flex-col space-y-2'>
                  <div className='flex items-center font-bold text-base leading-7'>
                    <div className='w-1/3'>
                      <span>{dataFlight?.arrival_to ? getPrefectureName(regions, dataFlight?.arrival_to) : ''}</span>
                    </div>
                    <div className='w-1/5'>
                      <span>予約ステータス : 完了</span>
                    </div>
                    <div className='flex-1'>
                      {`予約日時 : ${dataFlight?.day ? dayjs(dataFlight?.day).locale('ja').format(DATE_FORMAT.JAPANESE) : ''}${getMobitiHubEndTime()}`}
                    </div>
                  </div>
                  {(dataFlight?.vehicle_diagram_item_trailer || []).map((value, index) => (
                    <div key={index} className='flex items-center text-base leading-7'>
                      <div className='w-1/3'>
                        <span>
                          {`${getTrailer[index]?.vehicle_info?.registration_area_code || ''} ${getTrailer[index]?.vehicle_info?.registration_group_number || ''} ${getTrailer[index]?.vehicle_info?.registration_character || ''} ${getTrailer[index]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[index]?.vehicle_info?.vehicle_name || ''}`}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <span>{index === 0 ? '予約スペース:21453354856' : '予約スペース:21453354856'}</span>
                      </div>
                    </div>
                  ))}
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

      {dataFlight && openDateTime && (
        <OperationDateTime
          id={dataFlight.id}
          isOpen={openDateTime}
          onClose={() => setOpenDateTime(false)}
          onUpdateDataFlight={handleUpdateDataFlight}
          dataFlight={dataFlight as DataFlightListItem}
        />
      )}

      {dataFlight && openVehicle && (
        <VehicleAllocation
          id={dataFlight.id}
          isOpen={openVehicle}
          onClose={() => setOpenVehicle(false)}
          onUpdateDataFlight={handleUpdateDataFlight}
          dataFlight={dataFlight as DataFlightListItem}
        />
      )}

      {dataFlight && openFreight && (
        <FreightAdjustment
          id={dataFlight.id}
          isOpen={openFreight}
          onClose={() => setOpenFreight(false)}
          idTrailer={getTrailer[0]?.id as number}
          dataFlight={dataFlight as DataFlightListItem}
        />
      )}

      {dataFlight && (
        <DeleteFlight
          id={dataFlight?.id}
          onCloneFather={onClose}
          isOpen={openModalDelete}
          onClose={() => setOpenModalDelete(false)}
        />
      )}
    </>
  );
}

export default memo(FlightDetail);
