'use client';

import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';

import CmnCalendarPrice from '@/components/common/calendar-price/CmnCalendarPrice';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { FREQUENCY_OPTIONS, INIT_SCHEDULE_VEHICLE_INFO_LIST } from '@/constants/carrier';
import { FREIGHT_RATE, INIT_DELIVERY_ABILITY, VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import dayjs from '@/lib/dayjs';
import { DAY_OF_WEEK, DayOfWeekKey } from '@/lib/dayOfWeek';
import { getPrefectureName } from '@/lib/prefectures';
import { cn, formatCurrency, isEmptyObject } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType, ICalendarPrice } from '@/types/app';
import {
  DeliveryAbility,
  DeliveryAbilityRequest,
  DeliveryAbilityVehicleRequest,
  VehicleDiagramAllocation,
  VehicleDiagramItemTrailer,
  VehicleDiagramTrailerRequest,
} from '@/types/schedule';

import FareAdjustmentModal from './FareAdjustmentModal';
import ScheduleFormModal from './ScheduleFormModal';
import VehicleAllocationModal from './VehicleAllocationModal';
interface ScheduleDetailModalProps {
  isOpen: boolean;
  modeUpdate: boolean;
  detailData: DeliveryAbility | null;
  onClose: () => void;
  onSubmit: () => void;
  updateModeDetail: () => void;
  setLoading: (value: boolean) => void;
  getDetailDeliveryAbility: (id: string) => void;
}

const ScheduleDetailModal = (props: ScheduleDetailModalProps) => {
  const { modeUpdate, isOpen, detailData, onClose, onSubmit, updateModeDetail, setLoading, getDetailDeliveryAbility } =
    props;
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const scheduleApi = scheduleCarrierService();
  const dispatch = useAppDispatch();

  const [dataCalendarPrice, setDataCalendarPrice] = useState<ICalendarPrice[]>([]);
  const [formValue, setFormValue] = useState<DeliveryAbilityRequest>({ ...INIT_DELIVERY_ABILITY });
  const [formValueTrailer, setFormValueTrailer] = useState<VehicleDiagramTrailerRequest>();
  const [vehicleInfos, setVehicleInfos] = useState<Partial<VehicleDiagramAllocation>[]>(
    JSON.parse(JSON.stringify(INIT_SCHEDULE_VEHICLE_INFO_LIST)),
  );
  const [selectedTrailer, setSelectedTrailer] = useState<number>();
  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false);
  const [isOpenModalVehicle, setIsOpenModalVehicle] = useState<boolean>(false);
  const [isOpenModalFareAdjustment, setIsOpenModalFareAdjustment] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (detailData) {
      const _formValue: DeliveryAbilityRequest = {
        is_validate: true,
        id: detailData.id,
        departure_from: detailData.departure_from,
        stopper: detailData.stopper,
        arrival_to: detailData.arrival_to,
        one_way_time: detailData.one_way_time,
        start_date: detailData.start_date,
        end_date: detailData.end_date,
        repeat_day: detailData.repeat_day,
        trailer_number: detailData.trailer_number,
        is_round_trip: detailData.is_round_trip,
        origin_type: detailData.origin_type,
        import_id: detailData.import_id,
        status: detailData.status,
        vehicle_diagram: {
          round_trip_type: detailData.round_trip_type,
          trip_name: detailData.trip_name,
          departure_from: detailData.departure_from,
          stopper: detailData.stopper,
          arrival_to: detailData.arrival_to,
          departure_time: detailData.departure_time,
          arrival_time: detailData.arrival_time,
          day_week: detailData.day_week,
          adjustment_price: detailData.adjustment_price,
          common_price: detailData.common_price,
          cut_off_price: detailData.cut_off_price,
          status: detailData.status,
          id: detailData.id,
        },
      };
      setFormValue({ ..._formValue });
    }
    if (detailData?.vehicle_diagram_allocations) {
      const allocations: Partial<VehicleDiagramAllocation>[] = [];

      const tractor = detailData.vehicle_diagram_allocations.find(
        (allocation) => allocation.id && allocation.vehicle_type === VEHICLE_TYPE.TRACTOR,
      );

      //get tractor
      if (tractor) {
        allocations.push({
          ...tractor,
          display_order: 1,
        });
      } else {
        allocations.push(INIT_SCHEDULE_VEHICLE_INFO_LIST[0]);
      }
      // //get trailer
      const lstTrailer = detailData.vehicle_diagram_allocations.filter(
        (allocation) => allocation.id && allocation.vehicle_type === VEHICLE_TYPE.TRAILER,
      );
      lstTrailer.forEach((trailer) => {
        allocations.push(trailer);
      });
      if (allocations.length < 3) {
        Array.from({ length: 3 - allocations.length }).forEach((_, index) => {
          allocations.push(INIT_SCHEDULE_VEHICLE_INFO_LIST[index + 1]);
        });
      }
      setVehicleInfos([...allocations]);
      let allocationTrailers = lstTrailer.filter((allocation) => allocation.id);
      if (allocationTrailers.length > 0) {
        setSelectedTrailer(allocationTrailers[0].id || 0);
        const trailer = detailData.vehicle_diagram_item_trailers.find(
          (trailer) => trailer.vehicle_diagram_allocation_id === allocationTrailers[0].id,
        );
        if (trailer?.days) {
          setDataCalendarPrice(
            trailer?.days.map((dayTrailer) => {
              const date = dayjs(dayTrailer.day);
              return {
                price: dayTrailer.price,
                day: date.date().toString(),
                month: (date.month() + 1).toString(),
                year: date.year().toString(),
              };
            }),
          );
        }
      }
      let trailers = [...detailData.vehicle_diagram_item_trailers];
      let trailersNew: VehicleDiagramItemTrailer[] = [];
      allocationTrailers.forEach((allocation) => {
        const trailer = trailers.find((trailer) => trailer.vehicle_diagram_allocation_id === allocation.id);
        if (!trailer) {
          trailersNew.push({
            vehicle_diagram_allocation_id: allocation.id || 0,
            freight_rate_type: FREIGHT_RATE.COMMON,
            days: [],
          });
        } else {
          trailersNew.push(trailer);
        }
      });
      const _formValueTrailer: VehicleDiagramTrailerRequest = {
        trip_name: detailData.trip_name,
        departure_time: detailData.departure_time,
        arrival_time: detailData.arrival_time,
        cut_off_price: detailData.cut_off_price,
        trailers: trailersNew,
      };
      setFormValueTrailer({ ..._formValueTrailer });
    }
  }, [detailData]);

  const formatTimeHHmm = (time: string, currentFormat?: string) => {
    return dayjs(time, currentFormat || TIME_FORMAT.HHMMSS).format(TIME_FORMAT.HH_MM);
  };

  const getSection = () => {
    let sectionName = '-';
    if (formValue && formValue.departure_from && formValue.arrival_to) {
      sectionName = `${getPrefectureName(regions, Number(formValue.departure_from))} ～ ${getPrefectureName(regions, Number(formValue.arrival_to))}`;
    }
    return sectionName;
  };
  const getOperatingHours = () => {
    let operatingHours = '-';
    if (formValue && formValue.vehicle_diagram?.departure_time && formValue.vehicle_diagram?.arrival_time) {
      operatingHours = `出発時刻 ${formatTimeHHmm(formValue.vehicle_diagram.departure_time, TIME_FORMAT.HHMM)} ～ 到着時刻 ${formatTimeHHmm(formValue.vehicle_diagram.arrival_time, TIME_FORMAT.HHMM)}`;
    }
    return operatingHours;
  };

  const getRangeDate = () => {
    let rangeDate = '-';
    if (formValue && formValue.start_date && formValue.end_date) {
      rangeDate = `${dayjs(formValue?.start_date).format(DATE_FORMAT.DEFAULT)} ～ ${dayjs(formValue?.end_date).format(DATE_FORMAT.DEFAULT)}`;
    }
    return rangeDate;
  };

  const getDayOfWeek = () => {
    let dayOfWeek: string[] = [];
    if (formValue && formValue.vehicle_diagram?.day_week) {
      for (const [key] of Object.entries(formValue.vehicle_diagram.day_week)) {
        dayOfWeek.push(DAY_OF_WEEK[Number(key) as DayOfWeekKey]);
      }
    }
    return dayOfWeek.join('・');
  };

  const handleCloseModalDetail = () => {
    setIsOpenModalDetail(false);
  };

  const handleSelectTrailer = (id?: number) => {
    setSelectedTrailer(id || 0);
    const trailer = formValueTrailer?.trailers.find((trailer) => trailer.vehicle_diagram_allocation_id === id);

    if (trailer) {
      setDataCalendarPrice(
        trailer.days.map((dayTrailer) => {
          const date = dayjs(dayTrailer.day);
          return {
            price: dayTrailer.price,
            day: date.date().toString(),
            month: (date.month() + 1).toString(),
            year: date.year().toString(),
          };
        }),
      );
    } else {
      setDataCalendarPrice([]);
    }
  };

  const onCloseCreateSuccess = (response: any) => {
    const id = response?.ids && response?.ids.length > 0 ? response?.ids[0] + '' : '';
    if (id) {
      setLoading(true);
      getDetailDeliveryAbility(id);
      setIsSuccess(true);
      setIsOpenModalDetail(false);
      setLoading(false);
    }
  };

  const handleCloseCreateSuccess = (response: any) => {
    if (response?.status === ENotificationType.SUCCESS) {
      updateModeDetail();
      onCloseCreateSuccess(response);
    }
  };

  const handleSubmitSchedule = (value: DeliveryAbilityRequest) => {
    setLoading(true);
    if (modeUpdate && value.id) {
      // update
      scheduleApi
        .updateDeliveryAbility(value.id, value)
        .then((response) => {
          if (response?.status === ENotificationType.SUCCESS) {
            dispatch(
              actions.appAction.showModalResult({
                type: response?.status === ENotificationType.SUCCESS ? ENotificationType.INFO : ENotificationType.ERROR,
                title: '運行スケジュール修正',
                content: response?.message || gTxt('MESSAGES.SUCCESS'),
                onClose: () => {
                  getDetailDeliveryAbility(detailData?.id.toString() || '');
                  setIsSuccess(true);
                  setIsOpenModalDetail(false);
                },
              }),
            );
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.ERROR,
                title: '運行スケジュール修正',
                content: renderModalResult(response, value),
              }),
            );
          }
        })
        .catch((error) => {
          if (
            error?.payload?.responseData?.parameters?.error?.code == 'vehicle_diagram_item_trailer_have_in_trans_order'
          ) {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.ERROR,
                title: '輸送計画の編集',
                content: 'スケジュールは取引中のため編集できません。',
              }),
            );
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.ERROR,
                title: '運行スケジュール修正',
                content: gTxt('MESSAGES.FAILED'),
              }),
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // create
      scheduleApi
        .createDeliveryAbility(value)
        .then((response) => {
          if (response?.status === ENotificationType.SUCCESS) {
            dispatch(
              actions.appAction.showModalResult({
                type: response?.status === ENotificationType.SUCCESS ? ENotificationType.INFO : ENotificationType.ERROR,
                title: '運行スケジュール登録',
                content: response?.message || gTxt('MESSAGES.SUCCESS'),
                onClose: handleCloseCreateSuccess(response),
              }),
            );
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.ERROR,
                title: '運行スケジュール登録',
                content: renderModalResult(response, value),
              }),
            );
          }
        })
        .catch(() => {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '運行スケジュール登録',
              content: gTxt('MESSAGES.FAILED'),
            }),
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const createScheduleNotValidate = (value: DeliveryAbilityRequest) => {
    handleSubmitSchedule({ ...value, is_validate: false });
  };

  const handleCloseModalVehicle = () => {
    setIsOpenModalVehicle(false);
  };

  const handleChangeVehicle = async (value: Partial<VehicleDiagramAllocation>[]) => {
    if (detailData?.id) {
      setLoading(true);
      let data: DeliveryAbilityVehicleRequest[] = [];
      value.forEach((vehicle, index) => {
        if (vehicle.vehicle_info && vehicle.vehicle_info.id) {
          data.push({
            id: vehicle.id || null,
            vehicle_info_id: vehicle.vehicle_info.id,
            vehicle_type: vehicle.vehicle_type ?? 0,
            display_order: index + 1,
            assign_type: vehicle.assign_type ?? 0,
          });
        }
      });
      data = data.map((item, index) => {
        return {
          ...item,
          display_order: index + 1,
        };
      });
      scheduleApi
        .updateDeliveryAbilityVehicle(detailData.id, data)
        .then((response) => {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '車両割り当て修正',
              content: gTxt('MESSAGES.SUCCESS'),
              onClose: () => {
                getDetailDeliveryAbility(detailData?.id.toString() || '');
                setIsSuccess(true);
                setIsOpenModalVehicle(false);
              },
            }),
          );
        })
        .catch(() => {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '車両割り当て修正',
              content: gTxt('MESSAGES.FAILED'),
            }),
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleCloseFareAdjustment = () => {
    setIsOpenModalFareAdjustment(false);
  };

  const handleChangeFareAdjustment = (data: VehicleDiagramTrailerRequest) => {
    if (detailData?.id) {
      setLoading(true);
      scheduleApi
        .updateDeliveryAbilityVehiclePrice(detailData.id, data)
        .then(() => {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '運賃登録',
              content: gTxt('MESSAGES.SUCCESS'),
              onClose: () => {
                getDetailDeliveryAbility(detailData?.id.toString() || '');
                setIsSuccess(true);
                setIsOpenModalFareAdjustment(false);
              },
            }),
          );
        })
        .catch(() => {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '運賃登録',
              content: gTxt('MESSAGES.FAILED'),
            }),
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const renderModalResult = (response: any, value: DeliveryAbilityRequest) => {
    return (
      <div>
        <p className='text-base font-normal text-center'>{response?.message || gTxt('MESSAGES.SUCCESS')}</p>

        <div className='flex items-center justify-between'>
          <Button
            radius='sm'
            color='primary'
            onPress={() => dispatch(actions.appAction.hideModalResult())}
            className='border-none font-bold h-12 w-[6rem] text-base leading-normal mt-6'
          >
            閉じる
          </Button>
          <Button
            radius='sm'
            color='primary'
            onPress={() => createScheduleNotValidate(value)}
            className='border-none font-bold h-12 w-[6rem] text-base leading-normal mt-6'
          >
            登録に進む
          </Button>
        </div>
      </div>
    );
  };

  return (
    <CmnModal size='5xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader
        title={modeUpdate ? `運行スケジュール詳細 -  ${detailData?.trip_name || ''}` : '運行スケジュール個別登録'}
        description={
          modeUpdate ? '登録されている運行スケジュールの詳細です。' : '運行スケジュールを個別に登録することが可能です。'
        }
      />
      <CmnModalBody className='text-xs'>
        <div className='mt-3 bg-white'>
          <div className='p-4 rounded border border-other-gray'>
            <div className='grid grid-cols-1 gap-4 text-sm'>
              <div className='flex'>
                <div className='w-1/5 font-bold'>便名</div>
                <div className='w-4/5'>{formValue?.vehicle_diagram?.trip_name ?? '-'}</div>
              </div>
              <div className='flex'>
                <div className='w-1/5 font-bold'>区間</div>
                <div className='w-4/5'>{getSection()}</div>
              </div>
              <div className='flex'>
                <div className='w-1/5 font-bold'>運行時間</div>
                <div className='w-4/5'>{getOperatingHours()}</div>
              </div>
              <div className='flex'>
                <div className='w-1/5 font-bold'>運行日時</div>
                <div className='w-4/5'>{getRangeDate()}</div>
              </div>
              <div className='flex'>
                <div className='w-1/5 font-bold'>運行曜日</div>
                <div className='w-4/5'>
                  <span className='mr-8'>
                    {formValue.repeat_day ? FREQUENCY_OPTIONS[formValue.repeat_day]?.label : ''}
                  </span>
                  <span>{getDayOfWeek()}</span>
                </div>
              </div>
              <div className='flex'>
                <div className='w-1/5 font-bold'>曜日別時間</div>
                <div className='w-4/5'></div>
              </div>
              {formValue &&
                formValue.vehicle_diagram &&
                formValue.vehicle_diagram.day_week &&
                Object.entries(formValue.vehicle_diagram.day_week).map(([day, time]) => (
                  <div className='flex' key={day}>
                    <div className='w-1/5 font-bold'>{DAY_OF_WEEK[Number(day) as DayOfWeekKey]}</div>
                    <div className='w-4/5'>
                      出発時刻 {formatTimeHHmm(`${time.fromTime}`, TIME_FORMAT.HHMM)} ～ 到着時刻{' '}
                      {formatTimeHHmm(`${time.toTime}`, TIME_FORMAT.HHMM)}
                    </div>
                  </div>
                ))}
              <div className='flex items-center justify-end'>
                <Button size='lg' radius='sm' color='primary' onPress={() => setIsOpenModalDetail(true)}>
                  {modeUpdate ? '運行スケジュール修正' : '運行スケジュール登録'}
                </Button>
              </div>
            </div>
          </div>
          <div className='mt-3 p-4 rounded border border-other-gray'>
            <div className='grid grid-cols-1 gap-4 text-sm'>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'>割り当て車両</div>
                <div className='grid grid-cols-3 text-xs font-medium gap-2'>
                  {vehicleInfos.map((vehicle, index) => {
                    return (
                      <div key={`vehicle-${index}`} className='flex flex-col items-start justify-start'>
                        <div className='px-3 py-1 bg-other-gray rounded-lg text-white text-base font-bold'>
                          {vehicle.vehicle_type === VEHICLE_TYPE.TRACTOR
                            ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                            : gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                        </div>
                        <div
                          className={cn(
                            'flex flex-col items-start w-[8.5rem] px-2 py-[0.625rem] space-y-1 rounded-lg border border-[#BAC4CD] mt-1',
                            vehicle.vehicle_info?.id ? 'min-h-[5.25rem]' : '',
                          )}
                        >
                          {vehicle.vehicle_info?.id ? (
                            <>
                              <div className='text-xs truncate w-[7.5rem]'>{`${vehicle.vehicle_info.registration_area_code} ${vehicle.vehicle_info.registration_group_number} ${vehicle.vehicle_info.registration_character} ${vehicle.vehicle_info.registration_number_1}`}</div>
                              <div className='text-sm font-bold'>{vehicle.vehicle_info.vehicle_name}</div>
                            </>
                          ) : (
                            <>
                              <div>{gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className='flex items-center justify-end'>
                <Button
                  size='lg'
                  radius='sm'
                  color='primary'
                  isDisabled={!detailData?.id}
                  onPress={() => setIsOpenModalVehicle(true)}
                >
                  {modeUpdate ? '車両割り当て修正' : '車両割り当て登録'}
                </Button>
              </div>
            </div>
          </div>
          <div className='mt-3 p-4 rounded border border-other-gray'>
            <div className='grid grid-cols-1 gap-4 text-sm'>
              {vehicleInfos.filter(
                (vehicle) => vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
              ).length > 0 && (
                <div className='flex'>
                  <div className='w-1/5 font-bold'>車両別運賃選択</div>
                  <div className='w-3/4 grid grid-cols-2 text-xs font-medium gap-3'>
                    {vehicleInfos
                      .filter(
                        (vehicle) =>
                          vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
                      )
                      .map((vehicle, index) => {
                        return (
                          <div
                            key={`tab-vehicle-${index}`}
                            className={cn(
                              'cursor-pointer px-3 py-1 border-b-4 text-[#757575] truncate text-center',
                              selectedTrailer === vehicle.id ? 'border-primary text-foreground' : 'border-[#E8F1FE]',
                            )}
                            onClick={() => handleSelectTrailer(vehicle.id || 0)}
                          >
                            <span className='text-base'>{`${vehicle.vehicle_info?.registration_area_code} ${vehicle.vehicle_info?.registration_group_number} ${vehicle.vehicle_info?.registration_character} ${vehicle.vehicle_info?.registration_number_1}`}</span>
                            &#x3000;
                            <span className='text-base font-bold'>{vehicle.vehicle_info?.vehicle_name}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              <div className='flex'>
                <div className='w-1/5 font-bold'>基本運賃</div>
                <div className='w-4/5'>{detailData?.common_price ? `${detailData.common_price} 円` : ''}</div>
              </div>
              {vehicleInfos.filter(
                (vehicle) => vehicle.vehicle_info?.id && vehicle.vehicle_info.vehicle_type == VEHICLE_TYPE.TRAILER,
              ).length > 0 && (
                <>
                  <div className='flex'>
                    <CmnCalendarPrice
                      data={dataCalendarPrice}
                      modeView={true}
                      availableDays={(detailData?.vehicle_diagram_items || []).map((item) => item.day)}
                    />
                  </div>
                </>
              )}
              <div className='flex'>
                <div className='w-1/4 font-bold'>カットオフ運賃</div>
                <div className='w-3/4'></div>
              </div>

              {formValue &&
                formValue.vehicle_diagram &&
                formValue.vehicle_diagram.cut_off_price &&
                !isEmptyObject(formValue.vehicle_diagram.cut_off_price) && (
                  <>
                    {Object.entries(formValue.vehicle_diagram.cut_off_price).map(([index, cutoff]) => (
                      <div className='flex' key={`cutoff-${index}`}>
                        <div className='w-1/5 font-bold'>{`${index}時間前`}</div>
                        <div className='w-4/5'>
                          {typeof cutoff === 'number' ? `${formatCurrency(cutoff.toString())} 円` : '-'}
                        </div>
                      </div>
                    ))}
                  </>
                )}

              <div className='flex items-center justify-end'>
                <Button
                  size='lg'
                  radius='sm'
                  color='primary'
                  isDisabled={
                    !(
                      detailData &&
                      detailData.vehicle_diagram_allocations &&
                      detailData.vehicle_diagram_allocations.length > 0
                    )
                  }
                  onPress={() => setIsOpenModalFareAdjustment(true)}
                >
                  {modeUpdate ? '運賃修正' : '運賃登録'}
                </Button>
              </div>
            </div>
          </div>
          {isOpenModalDetail && (
            <ScheduleFormModal
              isOpen={isOpenModalDetail}
              modeUpdate={modeUpdate}
              detailData={formValue}
              setLoading={setLoading}
              onClose={handleCloseModalDetail}
              onSubmit={handleSubmitSchedule}
            />
          )}
          {isOpenModalVehicle && (
            <VehicleAllocationModal
              isOpen={isOpenModalVehicle}
              data={vehicleInfos}
              onClose={handleCloseModalVehicle}
              onSubmit={handleChangeVehicle}
            />
          )}
          {isOpenModalFareAdjustment && (
            <FareAdjustmentModal
              isOpen={isOpenModalFareAdjustment}
              vehicleDiagramItems={detailData?.vehicle_diagram_items || []}
              vehicleInfos={vehicleInfos}
              detailData={formValueTrailer}
              onSubmit={handleChangeFareAdjustment}
              onClose={handleCloseFareAdjustment}
            />
          )}
        </div>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: () => {
            if (isSuccess) {
              onSubmit();
            } else {
              onClose();
            }
          },
          children: '閉じる',
          className: 'font-bold text-base text-primary leading-normal bg-background border-none',
        }}
      />
    </CmnModal>
  );
};

export default ScheduleDetailModal;
