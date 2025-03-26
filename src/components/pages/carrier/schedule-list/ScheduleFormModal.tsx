'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { getLocalTimeZone, today } from '@internationalized/date';
import { Button, Form } from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import CmnDateRangePicker from '@/components/common/CmnDateRangePicker';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnFetchAutoComplete from '@/components/common/CmnFetchAutoComplete';
import CmnInput from '@/components/common/CmnInput';
import CmnTime from '@/components/common/CmnTime';
import CmnTimeInput, { TimeString } from '@/components/common/CmnTimeInput';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { FREQUENCY_OPTIONS } from '@/constants/carrier';
import { INIT_DELIVERY_ABILITY } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import dayjs from '@/lib/dayjs';
import { DAY_OF_WEEK } from '@/lib/dayOfWeek';
import { getRegionByPrefectureId } from '@/lib/prefectures';
import { objectToQueryParamsNoEncode } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { RootState } from '@/redux/store';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { DateString, Option } from '@/types/app';
import { DayWeek, DeliveryAbility, DeliveryAbilityRequest } from '@/types/schedule';
interface ScheduleFormModalProps {
  isOpen: boolean;
  modeUpdate: boolean;
  detailData: DeliveryAbilityRequest;
  onClose: () => void;
  onSubmit: (value: DeliveryAbilityRequest) => void;
  setLoading: (value: boolean) => void;
}

const dayWeekSchema = yup.lazy((value: Record<string, unknown>) =>
  yup.object(
    Object.keys(value || {}).reduce(
      (acc, key) => {
        acc[key] = yup.object({
          fromTime: yup.string().nullable(),
          toTime: yup.string().nullable(),
        });
        return acc;
      },
      {} as Record<string, yup.ObjectSchema<any>>,
    ),
  ),
);

const adjustmentPriceSchema = yup.lazy((value: Record<string, unknown>) =>
  yup.object(
    Object.keys(value || {}).reduce(
      (acc, key) => {
        acc[key] = yup.object({
          price: yup.number().nullable(),
          adjustment: yup.number().nullable(),
        });
        return acc;
      },
      {} as Record<string, yup.ObjectSchema<any>>,
    ),
  ),
);

const cutOffPriceSchema = yup.lazy((value: Record<string, unknown>) =>
  yup.object(
    Object.keys(value || {}).reduce(
      (acc, key) => {
        acc[key] = yup.number();
        return acc;
      },
      {} as Record<string, yup.NumberSchema<number | undefined>>,
    ),
  ),
);

const vehicleDiagramSchema = yup.object().shape({
  round_trip_type: yup.number().nullable(),
  trip_name: yup
    .string()
    .required(gTxt('VALIDATE.REQUIRED', { field: '便名' }))
    .max(20, gTxt('VALIDATE.MAX_LENGTH', { field: '便名', max: 20 })),
  departure_from: yup.number().nullable(),
  stopper: yup.number().nullable(),
  arrival_to: yup.number().nullable(),
  departure_time: yup.string().nullable(),
  arrival_time: yup.string().nullable(),
  day_week: dayWeekSchema,
  adjustment_price: adjustmentPriceSchema,
  common_price: yup.number().nullable(),
  status: yup.number().required(),
  cut_off_price: cutOffPriceSchema,
});

const schema = yup.object({
  vehicle_diagram: vehicleDiagramSchema,
  departure_from: yup
    .number()
    .required(gTxt('VALIDATE.REQUIRED', { field: '出発地' }))
    .nullable(),
  stopper: yup.number().nullable(),
  arrival_to: yup
    .number()
    .required(gTxt('VALIDATE.REQUIRED', { field: '到着地' }))
    .nullable(),
  start_date: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: '運行日時' })),
  end_date: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: '運行日時' })),
  repeat_day: yup.number().nullable(),
  is_round_trip: yup.boolean().nullable(),
  trailer_number: yup.number().nullable(),
  origin_type: yup.number().nullable(),
  one_way_time: yup.string().nullable(),
  status: yup.number().required(),
  import_id: yup.number().nullable(),
  is_validate: yup.boolean().required(),
});

const ScheduleFormModal = (props: ScheduleFormModalProps) => {
  const { modeUpdate, isOpen, detailData, setLoading, onClose, onSubmit } = props;

  const [regionDepartureFrom, setRegionDepartureFrom] = useState<string>('');
  const [regionStopper, setRegionStopper] = useState<string>('');
  const [regionArrivalTo, setRegionArrivalTo] = useState<string>('');

  const [formValue, setFormValue] = useState<DeliveryAbilityRequest>({ ...INIT_DELIVERY_ABILITY });
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [dataList, setDataList] = useState<DeliveryAbility[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number>();
  const [errorDayWeekMessage, setErrorDayWeekMessage] = useState<string>('');
  const [isLoadingDropdown, setIsLoadingDropdown] = useState<boolean>(false);
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const {
    register,
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formValue,
    mode: 'onChange',
  });

  useEffect(() => {
    if (JSON.stringify(detailData) !== JSON.stringify(formValue)) {
      reset(detailData);
      setFormValue(detailData);
      if (detailData.departure_from) {
        const regionDepartureFrom = getRegionByPrefectureId(regions, Number(detailData.departure_from));
        if (regionDepartureFrom) setRegionDepartureFrom(String(regionDepartureFrom.id));
      }

      if (detailData.stopper) {
        const regionStopper = getRegionByPrefectureId(regions, Number(detailData.stopper));
        if (regionStopper) setRegionStopper(String(regionStopper.id));
      }

      if (detailData.arrival_to) {
        const regionArrivalTo = getRegionByPrefectureId(regions, Number(detailData.arrival_to));
        if (regionArrivalTo) setRegionArrivalTo(String(regionArrivalTo.id));
      }
    }
  }, [detailData]);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (page: number) => {
    setIsLoadingDropdown(true);
    const scheduleCarrierApi = scheduleCarrierService();
    scheduleCarrierApi
      .deliveryAbility(objectToQueryParamsNoEncode({ page, pageSize: 20, trailer: false }))
      .then((response) => {
        setDataList((prevDataList) => {
          const newDataList = [...prevDataList, ...(response.dataList || [])];
          return newDataList.filter((item, index, self) => self.findIndex((t) => t.id === item.id) === index);
        });
        setTotalPage(response.totalPage);
      })
      .catch((error) => {
        console.log('error', error);
      })
      .finally(() => {
        setIsLoadingDropdown(false);
      });
  };

  useEffect(() => {
    if (selectedScheduleId) {
      setLoading(true);
      const schedule = dataList.find((item) => item.id === selectedScheduleId);
      if (schedule) {
        const _formValue: DeliveryAbilityRequest = {
          ...formValue,
          is_validate: true,
          departure_from: schedule.departure_from,
          stopper: schedule.stopper,
          arrival_to: schedule.arrival_to,
          start_date: schedule.start_date,
          end_date: schedule.end_date,
          repeat_day: schedule.repeat_day,
          is_round_trip: schedule.is_round_trip,
          origin_type: schedule.origin_type,
          one_way_time: schedule.one_way_time,
          status: schedule.status,
          import_id: schedule.import_id,
          vehicle_diagram: {
            trip_name: schedule.trip_name,
            round_trip_type: schedule.round_trip_type,
            departure_from: schedule.departure_from,
            stopper: schedule.stopper,
            arrival_to: schedule.arrival_to,
            departure_time: schedule.departure_time,
            arrival_time: schedule.arrival_time,
            day_week: schedule.day_week,
            adjustment_price: schedule.adjustment_price,
            status: schedule.status,
            cut_off_price: schedule.cut_off_price,
          },
        };
        setFormValue(_formValue);
        reset(_formValue);

        if (schedule.departure_from) {
          const regionDepartureFrom = getRegionByPrefectureId(regions, Number(schedule.departure_from));
          if (regionDepartureFrom) setRegionDepartureFrom(String(regionDepartureFrom.id));
        }

        if (schedule.stopper) {
          const regionStopper = getRegionByPrefectureId(regions, Number(schedule.stopper));
          if (regionStopper) setRegionStopper(String(regionStopper.id));
        }

        if (schedule.arrival_to) {
          const regionArrivalTo = getRegionByPrefectureId(regions, Number(schedule.arrival_to));
          if (regionArrivalTo) setRegionArrivalTo(String(regionArrivalTo.id));
        }
      }
      const timeOut = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timeOut);
    }
  }, [selectedScheduleId]);

  const convertRegionsToListDropdown = (optional: boolean = false): Option[] => {
    const regionOptions = regions.map((region) => ({
      key: `${region.id}`,
      label: region.name,
    }));

    return optional ? [{ key: '0', label: 'なし' }, ...regionOptions] : regionOptions;
  };

  const formatTimeHHmm = (time?: string | null, currentFormat?: string) => {
    return time ? dayjs(time, currentFormat || TIME_FORMAT.HHMMSS).format(TIME_FORMAT.HH_MM) : null;
  };

  const formatTimeRequest = (time?: string | null) => {
    return time ? dayjs(time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HHMM) : null;
  };

  const formatDate = (date?: string) => {
    return date ? dayjs(date, DATE_FORMAT.YYYYMMDD).format(DATE_FORMAT.DEFAULT) : undefined;
  };

  const formatDateRequest = (date?: string) => {
    return date ? dayjs(date, DATE_FORMAT.DEFAULT).format(DATE_FORMAT.YYYYMMDD) : undefined;
  };

  const getLstPrefectures = (region: string): Option[] => {
    let _regions = regions.find((r) => r.id === Number(region));
    if (_regions) {
      return _regions.prefectures.map((p) => ({
        key: `${p.id}`,
        label: p.name,
      }));
    }
    return [];
  };

  const checkIsActiveDayWeek = (day: number) => {
    const _startDate = watch('start_date');
    const _endDate = watch('end_date');
    if (_startDate && _endDate) {
      for (let i = 0; i <= dayjs(_endDate).diff(dayjs(_startDate), 'day'); i++) {
        const date = dayjs(_startDate).add(i, 'day');
        const currentDayOfWeek = date.day() === 0 ? 7 : date.day();
        if (day === currentDayOfWeek) {
          return true;
        }
      }
    }
    return false;
  };

  const onChangeTime = (data: any) => {
    const dataTime = {
      timeStart: data.timeStart ? formatTimeRequest(data.timeStart) : null,
      timeEnd: data.timeEnd ? formatTimeRequest(data.timeEnd) : null,
    };
    setValue('vehicle_diagram.departure_time', dataTime.timeStart);
    setValue('vehicle_diagram.arrival_time', dataTime.timeEnd);
    clearErrors('vehicle_diagram.departure_time');
    clearErrors('vehicle_diagram.arrival_time');
    if (watch('repeat_day') === 0 && dataTime.timeStart && dataTime.timeEnd) {
      const dayWeek: DayWeek = {};
      Object.keys(DAY_OF_WEEK).forEach((key) => {
        if (checkIsActiveDayWeek(Number(key))) {
          dayWeek[key] = { fromTime: dataTime.timeStart ?? '', toTime: dataTime.timeEnd ?? '' };
        }
      });
      setValue('vehicle_diagram.day_week', dayWeek);
    }
  };

  const isValidDayWeek = useMemo(() => {
    return Object.keys(watch('vehicle_diagram.day_week') || {}).length > 0;
  }, [watch('vehicle_diagram.day_week')]);

  const handleSubmitForm = (value: DeliveryAbilityRequest) => {
    console.log('value', value);

    if (!isValidDayWeek) {
      setErrorDayWeekMessage(gTxt('VALIDATE.REQUIRED', { field: '曜日指定' }));
    } else {
      setErrorDayWeekMessage('');
      onSubmit(value);
    }
  };

  return (
    <CmnModal size='4xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader
        title={modeUpdate ? '運行スケジュール修正' : '運行スケジュール登録'}
        description={
          modeUpdate ? '登録されている運行スケジュールを修正します。' : '登録されている運行スケジュールを登録します。'
        }
      />
      <CmnModalBody className='text-xs'>
        <Form className='p-4 rounded border border-other-gray' onSubmit={handleSubmit(handleSubmitForm)}>
          <div className=''>
            <div className='text-2xl'>運行スケジュール</div>
            <div className='mt-4 text-sm font-bold'>登録済み運行スケジュール読み込み</div>
            <div className='text-xs text-[#626264]'>
              すでに登録されている運行スケジュールのコピーを読み込んで編集することが可能です。
            </div>
            <CmnFetchAutoComplete
              width='w-44 max-w-44'
              classNameWrap='mt-4'
              isLoading={isLoadingDropdown}
              items={dataList.map((item) => ({
                key: `${item.id}`,
                label: item.trip_name,
              }))}
              placeholder={gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}
              selected={selectedScheduleId ? `${selectedScheduleId}` : undefined}
              fetchMoreData={() => {
                if (page < totalPage) {
                  setPage(page + 1);
                }
              }}
              onChange={(value) => {
                if (selectedScheduleId === Number(value)) {
                  setSelectedScheduleId(undefined);
                  setFormValue({ ...INIT_DELIVERY_ABILITY });
                  setRegionDepartureFrom('');
                  setRegionStopper('');
                  setRegionArrivalTo('');
                  reset({ ...INIT_DELIVERY_ABILITY });
                } else {
                  setSelectedScheduleId(Number(value));
                }
              }}
            />
            <div className='grid grid-cols-1 gap-2 text-sm mt-2'>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'>便名</div>
                <div className='w-4/5'>
                  <CmnInput
                    register={register}
                    name='vehicle_diagram.trip_name'
                    classNameWrap='w-40'
                    size='md'
                    value={watch('vehicle_diagram.trip_name')}
                    errorMessage={errors.vehicle_diagram?.trip_name?.message}
                  />
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'>区間</div>
                <div className='w-4/5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-1/5 font-bold'>出発地</div>
                    <div className='w-4/5 flex space-x-2'>
                      <CmnDropdown
                        classNameWrap='min-w-40 w-40'
                        placeholder='なし'
                        items={convertRegionsToListDropdown()}
                        size='md'
                        selectedKeys={[regionDepartureFrom]}
                        disallowEmptySelection
                        onChange={(e) => {
                          setRegionDepartureFrom(e.target.value);
                        }}
                      />
                      <CmnDropdown
                        classNameWrap='min-w-40 w-40'
                        placeholder='なし'
                        items={getLstPrefectures(regionDepartureFrom)}
                        size='md'
                        selectedKeys={watch('departure_from') ? [`${watch('departure_from')}`] : []}
                        disallowEmptySelection
                        errorMessage={errors.departure_from?.message}
                        onChange={(e) => {
                          setValue('departure_from', e.target.value ? Number(e.target.value) : null);
                          setValue('vehicle_diagram.departure_from', e.target.value ? Number(e.target.value) : null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'></div>
                <div className='w-4/5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-1/5 font-bold'>経由地</div>
                    <div className='w-4/5 flex space-x-2'>
                      <CmnDropdown
                        classNameWrap='min-w-40 w-40'
                        placeholder='なし'
                        items={convertRegionsToListDropdown(true)}
                        size='md'
                        selectedKeys={[regionStopper]}
                        disallowEmptySelection
                        onChange={(e) => {
                          setRegionStopper(e.target.value);
                        }}
                      />
                      <CmnDropdown
                        classNameWrap='min-w-40 w-40'
                        placeholder='なし'
                        items={getLstPrefectures(regionStopper)}
                        size='md'
                        selectedKeys={watch('stopper') ? [`${watch('stopper')}`] : []}
                        disallowEmptySelection
                        errorMessage={errors.stopper?.message}
                        onChange={(e) => {
                          setValue('stopper', e.target.value ? Number(e.target.value) : null);
                          setValue('vehicle_diagram.stopper', e.target.value ? Number(e.target.value) : null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'></div>
                <div className='w-4/5'>
                  <div className='flex items-center gap-4'>
                    <div className='w-1/5 font-bold'>到着地</div>
                    <div className='w-4/5 flex space-x-2'>
                      <CmnDropdown
                        classNameWrap='min-w-40 w-40'
                        placeholder='なし'
                        items={convertRegionsToListDropdown()}
                        size='md'
                        selectedKeys={[regionArrivalTo]}
                        disallowEmptySelection
                        onChange={(e) => {
                          setRegionArrivalTo(e.target.value);
                        }}
                      />
                      <CmnDropdown
                        classNameWrap='min-w-40 w-40'
                        placeholder='なし'
                        items={getLstPrefectures(regionArrivalTo)}
                        size='md'
                        selectedKeys={watch('arrival_to') ? [`${watch('arrival_to')}`] : []}
                        disallowEmptySelection
                        errorMessage={errors.arrival_to?.message}
                        onChange={(e) => {
                          setValue('arrival_to', e.target.value ? Number(e.target.value) : null);
                          setValue('vehicle_diagram.arrival_to', e.target.value ? Number(e.target.value) : null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'>区間時間(参考)</div>
                <div className='w-4/5'>
                  <CmnTime
                    classNameWrap='w-44 min-w-44'
                    size='md'
                    defaultTime={
                      watch('one_way_time')
                        ? (dayjs(watch('one_way_time'), 'HHmm').format('HH:mm') as TimeString)
                        : (undefined as TimeString | undefined)
                    }
                    onChangeTime={(timeValue) => {
                      setValue('one_way_time', formatTimeRequest(timeValue));
                      if (watch('vehicle_diagram.departure_time') && watch('vehicle_diagram.arrival_time')) {
                        // covert timeValue to minute (example: 1:30 -> 90)
                        const hourArr = timeValue.split(':');
                        const timeValueMinute = Number(hourArr[0]) * 60 + Number(hourArr[1]);
                        const endTime = dayjs(watch('vehicle_diagram.departure_time'), TIME_FORMAT.HHMM).add(
                          timeValueMinute,
                          'minute',
                        );
                        onChangeTime({
                          timeStart: dayjs(watch('vehicle_diagram.departure_time'), TIME_FORMAT.HHMM).format(
                            TIME_FORMAT.HH_MM,
                          ),
                          timeEnd: endTime.format(TIME_FORMAT.HH_MM),
                        });
                        // setValue('vehicle_diagram.arrival_time', endTime.format(TIME_FORMAT.HHMM));
                      }
                    }}
                  />
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'>運行時間</div>
                <div className='w-4/5'>
                  <CmnTimeInput
                    classNameWrap='w-44 min-w-44'
                    size='md'
                    validateRange={false}
                    showBtnDelete={true}
                    onError={(message: string) => {
                      message && setError('vehicle_diagram.departure_time', { message });
                    }}
                    onChangeTime={onChangeTime}
                    defaultTimeStart={
                      formatTimeHHmm(watch('vehicle_diagram.departure_time'), TIME_FORMAT.HHMM) as TimeString
                    }
                    defaultTimeEnd={
                      formatTimeHHmm(watch('vehicle_diagram.arrival_time'), TIME_FORMAT.HHMM) as TimeString | undefined
                    }
                    errorMessage={
                      errors?.vehicle_diagram?.departure_time?.message || errors?.vehicle_diagram?.arrival_time?.message
                    }
                  />
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-1/5 font-bold'>運行日時</div>
                <div className='w-4/5'>
                  <CmnDateRangePicker
                    classNameWrap='w-60'
                    size='md'
                    radius='sm'
                    minValue={today(getLocalTimeZone())}
                    date={
                      watch('start_date') && watch('end_date')
                        ? {
                            start: formatDate(watch('start_date')) || '',
                            end: formatDate(watch('end_date')) || '',
                          }
                        : null
                    }
                    onChangeValue={(value) => {
                      setValue('start_date', formatDateRequest(value?.start) as DateString);
                      setValue('end_date', formatDateRequest(value?.end) as DateString);
                      errors.start_date?.message && clearErrors('start_date');
                      errors.end_date?.message && clearErrors('end_date');
                      if (
                        watch('repeat_day') === 0 &&
                        watch('vehicle_diagram.departure_time') &&
                        watch('vehicle_diagram.arrival_time')
                      ) {
                        const dayWeek: DayWeek = {};
                        Object.keys(DAY_OF_WEEK).forEach((key) => {
                          if (checkIsActiveDayWeek(Number(key))) {
                            dayWeek[key] = {
                              fromTime: watch('vehicle_diagram.departure_time') ?? '',
                              toTime: watch('vehicle_diagram.arrival_time') ?? '',
                            };
                          }
                        });
                        setValue('vehicle_diagram.day_week', dayWeek);
                      }
                      if (value && value?.start > value?.end) {
                        setError('start_date', { message: gTxt('VALIDATE.START_DATE_BEFORE_END_DATE') });
                      }
                    }}
                    errorMessage={errors?.start_date?.message || errors?.end_date?.message}
                  />
                </div>
              </div>
              <div className='flex items-center'>
                <div className='w-24 font-bold'>運行曜日</div>
                <div className='flex-1'>
                  <div className='flex items-center gap-4'>
                    <div className='w-16 font-bold'>頻度</div>
                    <div className='flex-1 flex space-x-2'>
                      <CmnDropdown
                        classNameWrap='min-w-20 w-20'
                        items={FREQUENCY_OPTIONS}
                        selectedKeys={
                          watch('repeat_day') != null && watch('repeat_day') !== undefined
                            ? [String(watch('repeat_day'))]
                            : []
                        }
                        size='md'
                        disallowEmptySelection
                        onChange={(e) => {
                          setValue('repeat_day', Number(e.target.value));
                          const departmentTime = watch('vehicle_diagram.departure_time');
                          const arrivalTime = watch('vehicle_diagram.arrival_time');
                          if (e.target.value === '0' && departmentTime && arrivalTime) {
                            const dayWeek: DayWeek = {};
                            Object.keys(DAY_OF_WEEK).forEach((key) => {
                              if (checkIsActiveDayWeek(Number(key))) {
                                dayWeek[key] = { fromTime: departmentTime, toTime: arrivalTime };
                              }
                            });
                            setValue('vehicle_diagram.day_week', dayWeek);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {Object.entries(DAY_OF_WEEK).map(([key, value], index) => (
                <div className='flex items-center' key={key}>
                  <div className='w-24 font-bold'>{index == 0 ? '曜日指定' : ''}</div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-4'>
                      <div className='w-16 font-bold'>{value}</div>
                      <div className='flex-1 flex space-x-2'>
                        <CmnTimeInput
                          classNameWrap='w-44 min-w-44'
                          size='md'
                          showBtnDelete={true}
                          onChangeTime={(data: any) => {
                            const dataTime = {
                              timeStart: data.timeStart ? formatTimeRequest(data.timeStart) : null,
                              timeEnd: data.timeEnd ? formatTimeRequest(data.timeEnd) : null,
                            };
                            // when timeStart and timeEnd are null, remove the key in the day_week object
                            if (!data.timeStart && !data.timeEnd) {
                              const dayWeek = watch('vehicle_diagram.day_week');
                              delete dayWeek[key];
                              setValue('vehicle_diagram.day_week', dayWeek);
                            } else {
                              setValue(`vehicle_diagram.day_week.${key}.fromTime`, dataTime.timeStart);
                              setValue(`vehicle_diagram.day_week.${key}.toTime`, dataTime.timeEnd);
                            }
                          }}
                          defaultTimeStart={
                            formatTimeHHmm(watch(`vehicle_diagram.day_week.${key}.fromTime`), TIME_FORMAT.HHMM) as
                              | TimeString
                              | undefined
                          }
                          defaultTimeEnd={
                            formatTimeHHmm(watch(`vehicle_diagram.day_week.${key}.toTime`), TIME_FORMAT.HHMM) as
                              | TimeString
                              | undefined
                          }
                          disabled={!checkIsActiveDayWeek(Number(key))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {errorDayWeekMessage && <div className='text-red-500 text-xs mt-2'>{errorDayWeekMessage}</div>}
            </div>
          </div>
          <div className='w-full flex items-center justify-end'>
            <Button color='primary' className='font-bold text-base leading-normal' size='lg' radius='sm' type='submit'>
              <div className='text-bold'>入力確定</div>
            </Button>
          </div>
        </Form>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '閉じる',
          className: 'font-bold text-base text-primary leading-normal bg-background border-none',
        }}
      />
    </CmnModal>
  );
};

export default ScheduleFormModal;
