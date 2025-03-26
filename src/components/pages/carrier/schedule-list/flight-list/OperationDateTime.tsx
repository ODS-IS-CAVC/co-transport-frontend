'use client';
import { Button } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInput from '@/components/common/CmnInput';
import CmnTime from '@/components/common/CmnTime';
import CmnTimeInput, { TimeString } from '@/components/common/CmnTimeInput';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TRIP_TYPE_OPTIONS } from '@/constants/carrier';
import { TIME_FORMAT } from '@/constants/constants';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { getRegionByPrefectureId } from '@/lib/prefectures';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType, Option } from '@/types/app';
import { DataFlightListItem } from '@/types/schedule';

const updateDetailFlight = async ({ id, data }: { id: number; data: DataFlightListItem }) => {
  const userToken = getCookie(KEY_COOKIE_TOKEN);
  const scheduleCarrierApi = scheduleCarrierService(userToken as string);
  return await scheduleCarrierApi.updateDetailFlight(id, data);
};

interface DataForm {
  one_way_time: string;
  arrival_time: string;
  departure_time: string;
}

interface OperationDateTimeProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  dataFlight: DataFlightListItem;
  onUpdateDataFlight: (data: DataFlightListItem) => void;
}

function OperationDateTime(props: OperationDateTimeProps) {
  const { id, dataFlight, isOpen = false, onClose = () => null, onUpdateDataFlight = () => null } = props;
  const regions = useAppSelector((state: RootState) => state.app.locations);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    watch,
    setValue,
    clearErrors,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DataForm>({
    defaultValues: {
      one_way_time: dataFlight?.one_way_time || '',
      arrival_time: dataFlight?.arrival_time || '',
      departure_time: dataFlight?.departure_time || '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [regionStopper, setRegionStopper] = useState<string>('');
  const [regionArrivalTo, setRegionArrivalTo] = useState<string>('');
  const [regionDepartureFrom, setRegionDepartureFrom] = useState<string>('');

  useEffect(() => {
    if (dataFlight?.departure_from) {
      const regionDepartureFrom = getRegionByPrefectureId(regions, Number(dataFlight.departure_from));
      regionDepartureFrom && setRegionDepartureFrom(String(regionDepartureFrom.id));
    }

    if (dataFlight?.stopper) {
      const regionStopper = getRegionByPrefectureId(regions, Number(dataFlight.stopper));
      regionStopper && setRegionStopper(String(regionStopper.id));
    }

    if (dataFlight?.arrival_to) {
      const regionArrivalTo = getRegionByPrefectureId(regions, Number(dataFlight.arrival_to));
      regionArrivalTo && setRegionArrivalTo(String(regionArrivalTo.id));
    }

    if (!dataFlight?.one_way_time) {
      setValue('one_way_time', '01:30');
      // const timeValueMinute = 90;
      // const endTime = dayjs(watch('departure_time'), TIME_FORMAT.HHMM).add(timeValueMinute, 'minute');
      // setValue('arrival_time', endTime.format(TIME_FORMAT.HHMM));
    }
  }, [dataFlight]);

  const convertRegionsToListDropdown = (): Option[] => {
    return regions.map((region) => {
      return {
        key: `${region.id}`,
        label: region.name,
      };
    });
  };

  const getLstPrefectures = (region: string): Option[] => {
    const _regions = regions.find((r) => r.id === Number(region));
    if (_regions) {
      return _regions.prefectures.map((p) => ({
        key: `${p.id}`,
        label: p.name,
      }));
    }
    return [];
  };

  const onChangeOneWayTime = (timeValue: TimeString) => {
    const value = timeValue.replace(':', '');
    setValue('one_way_time', value);

    if (watch('departure_time') && watch('arrival_time')) {
      // covert timeValue to minute (example: 1:30 -> 90)
      const hourArr = timeValue.split(':');
      const timeValueMinute = Number(hourArr[0]) * 60 + Number(hourArr[1]);
      const endTime = dayjs(watch('departure_time'), TIME_FORMAT.HHMM).add(timeValueMinute, 'minute');
      handleChangeTime({
        timeStart: dayjs(watch('departure_time'), TIME_FORMAT.HHMM).format(TIME_FORMAT.HH_MM),
        timeEnd: endTime.format(TIME_FORMAT.HH_MM),
      });
    }
  };

  const handleChangeTime = (data: any) => {
    data?.timeEnd && setValue('arrival_time', data?.timeEnd?.replace(':', ''));
    data?.timeStart && setValue('departure_time', data?.timeStart?.replace(':', ''));
    errors?.arrival_time?.message && clearErrors('arrival_time');
    errors?.departure_time?.message && clearErrors('departure_time');
  };

  const handleSubmitForm = async (data: DataForm) => {
    const dataUpdate = {
      ...dataFlight,
      arrival_time: data.arrival_time,
      one_way_time: data.one_way_time,
      departure_time: data.departure_time,
    };

    setLoading(true);
    updateDetailFlight({
      id,
      data: dataUpdate,
    })
      .then((response) => {
        if (response?.status === ENotificationType.SUCCESS) {
          router.refresh();
          onUpdateDataFlight(dataUpdate);
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '運行時間修正',
              content: response?.message || gTxt('MESSAGES.SUCCESS'),
            }),
          );
        } else {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '運行時間修正',
              content: response?.message || gTxt('MESSAGES.FAILED'),
            }),
          );
        }
      })
      .catch((error) => {
        dispatch(
          actions.appAction.showModalResult({
            type: ENotificationType.ERROR,
            title: '運行時間修正',
            content: error?.message || gTxt('MESSAGES.FAILED'),
          }),
        );
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <CmnModal isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='運行日時修正' description='登録されている運行日時を修正します。' />
      <CmnModalBody>
        <div className='text-sm font-normal leading-[1.225rem] border rounded-lg border-other-gray p-6'>
          <h3>運行スケジュール</h3>
          <p className='text-[#000000] font-bold text-base leading-7 mt-3'>登録済み運行スケジュール読み込み</p>
          <p className='mt-3'>すでに登録されている運行スケジュールのコピーを読み込んで編集することが可能です。</p>

          <div className='mt-3 w-44 max-w-44'>
            <CmnDropdown
              size='md'
              disallowEmptySelection
              items={TRIP_TYPE_OPTIONS}
              placeholder={gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}
              classNameWrap='min-w-full pointer-events-none'
            />
          </div>
          <div className='flex items-center mt-4'>
            <div className='w-32 text-[#000000] font-bold text-base leading-7'>便名</div>
            <CmnInput
              size='md'
              name='vehicle_diagram.trip_name'
              value={dataFlight?.trip_name || ''}
              classNameWrap='w-40 pointer-events-none'
            />
          </div>

          <div className='flex items-center mt-4'>
            <div className='w-32 text-[#000000] font-bold text-base leading-7'>区間</div>
            <div className='flex items-center gap-4'>
              <div className='w-24 text-[#000000] font-bold text-base leading-7'>出発地</div>
              <div className='flex space-x-2'>
                <CmnDropdown
                  size='md'
                  placeholder='なし'
                  disallowEmptySelection
                  selectedKeys={[regionDepartureFrom]}
                  items={convertRegionsToListDropdown()}
                  classNameWrap='min-w-40 w-40 pointer-events-none'
                />
                <CmnDropdown
                  size='md'
                  placeholder='なし'
                  disallowEmptySelection
                  items={getLstPrefectures(regionDepartureFrom)}
                  classNameWrap='min-w-40 w-40 pointer-events-none'
                  selectedKeys={dataFlight?.departure_from ? [`${dataFlight.departure_from}`] : []}
                />
              </div>
            </div>
          </div>

          <div className='flex items-center mt-2'>
            <div className='w-32 text-[#000000] font-bold text-base leading-7' />
            <div className='flex items-center gap-4'>
              <div className='w-24 text-[#000000] font-bold text-base leading-7'>経由地</div>
              <div className='flex space-x-2'>
                <CmnDropdown
                  size='md'
                  placeholder='なし'
                  disallowEmptySelection
                  selectedKeys={[regionStopper]}
                  items={convertRegionsToListDropdown()}
                  classNameWrap='min-w-40 w-40 pointer-events-none'
                />
                <CmnDropdown
                  size='md'
                  placeholder='なし'
                  disallowEmptySelection
                  items={getLstPrefectures(regionStopper)}
                  classNameWrap='min-w-40 w-40 pointer-events-none'
                  selectedKeys={dataFlight?.stopper ? [`${dataFlight.stopper}`] : []}
                />
              </div>
            </div>
          </div>

          <div className='flex items-center mt-2'>
            <div className='w-32 text-[#000000] font-bold text-base leading-7' />
            <div className='flex items-center gap-4'>
              <div className='w-24 text-[#000000] font-bold text-base leading-7'>到着地</div>
              <div className='flex space-x-2'>
                <CmnDropdown
                  size='md'
                  placeholder='なし'
                  disallowEmptySelection
                  selectedKeys={[regionArrivalTo]}
                  items={convertRegionsToListDropdown()}
                  classNameWrap='min-w-40 w-40 pointer-events-none'
                />
                <CmnDropdown
                  size='md'
                  placeholder='なし'
                  disallowEmptySelection
                  items={getLstPrefectures(regionArrivalTo)}
                  classNameWrap='min-w-40 w-40 pointer-events-none'
                  selectedKeys={dataFlight?.arrival_to ? [`${dataFlight?.arrival_to}`] : []}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <div className='flex items-center mt-4'>
              <div className='w-32 text-[#000000] font-bold text-base leading-7'>区間時間(参考)</div>
              <div className='w-24'>
                <CmnTime
                  size='md'
                  classNameWrap='w-[14rem] min-w-[14rem]'
                  onChangeTime={onChangeOneWayTime}
                  defaultTime={
                    watch('one_way_time') ? (dayjs(watch('one_way_time'), 'HHmm').format('HH:mm') as any) : '00:00'
                  }
                />
              </div>
            </div>

            <div className='flex items-center mt-4'>
              <div className='w-32 text-[#000000] font-bold text-base leading-7'>運行時間</div>
              <div className='w-24'>
                <CmnTimeInput
                  size='md'
                  classNameWrap='w-[14rem] min-w-[14rem]'
                  onChangeTime={handleChangeTime}
                  errorMessage={errors?.departure_time?.message || errors?.arrival_time?.message}
                  // validateRange={false}
                  defaultTimeStart={
                    watch('departure_time') ? (dayjs(watch('departure_time'), 'HHmm').format('HH:mm') as any) : '00:00'
                  }
                  defaultTimeEnd={
                    watch('arrival_time') ? (dayjs(watch('arrival_time'), 'HHmm').format('HH:mm') as any) : '00:00'
                  }
                  onError={(message: string) => {
                    message && setError('departure_time', { message });
                  }}
                />
              </div>
            </div>

            <div className='flex justify-end'>
              <Button
                radius='sm'
                type='submit'
                color='primary'
                isLoading={loading}
                className='h-12 px-4 font-bold text-base leading-6'
              >
                入力確定
              </Button>
            </div>
          </form>
        </div>
      </CmnModalBody>

      <CmnModalFooter
        buttonLeftFirst={{
          children: '閉じる',
          onPress: onClose,
          className: 'border-1 text-base font-bold px-4 border-none bg-background',
        }}
      />
    </CmnModal>
  );
}

export default OperationDateTime;
