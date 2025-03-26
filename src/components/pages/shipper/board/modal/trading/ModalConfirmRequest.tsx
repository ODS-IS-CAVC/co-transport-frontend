'use client';

import { Time } from '@internationalized/date';
import { Button, Skeleton, TimeInput } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import CmnDatePicker from '@/components/common/CmnDatePicker';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInput from '@/components/common/CmnInput';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { convertCurrencyToNumber, formatCurrency, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { CutOffInfoType } from '@/types/shipper/transaction';
import { ITransportPlanSale } from '@/types/shipper/transport';

interface ModalConfirmRequestProps {
  onClose: () => void;
  onSubmit: (data: any | undefined) => void;
  dataItem?: any;
  cutOffInfos?: CutOffInfoType[];
  dataTransportSaleDetail?: ITransportPlanSale;
}

const ModalConfirmRequest = ({
  onClose,
  onSubmit,
  dataItem,
  cutOffInfos,
  dataTransportSaleDetail,
}: ModalConfirmRequestProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);
  const [data, setData] = useState<any | undefined>(dataItem);
  const [dataPropose, setDataPropose] = useState<any | undefined>(dataItem);

  const itemDropdowns =
    (cutOffInfos &&
      cutOffInfos.map((item) => ({
        key: item.id.toString(),
        label: `${item.cutOffTime} 時間前 ${item.cutOffFee}円`,
      }))) ||
    [];

  useEffect(() => {
    if (!dataItem) return;
    setDataPropose((prev: any) =>
      prev
        ? {
            ...prev,
            arrival_date: dataItem.day,
            departure_date: dataItem.day,
            departure_time_min: dataItem.departure_time_min,
            arrival_time: dataItem.arrival_time,
          }
        : prev,
    );
  }, []);

  const handleApply = () => {
    setData(dataPropose);
  };
  const handleSelectCutOffInfos = (value: number) => {
    const cutOff = cutOffInfos?.find((c) => c.id === value);
    if (!cutOff) return;
    setDataPropose((prev: any) =>
      prev
        ? {
            ...prev,
            cut_off_fee: cutOff.cutOffFee,
            cut_off_time: cutOff.cutOffTime,
          }
        : prev,
    );
  };

  const [hourDepartureTimeMin, minuteDepartureTimeMin] = data?.departure_time_max
    ? data.departure_time_max.split(':').map(Number)
    : [];
  const [hourArrivalTime, minuteArrivalTime] = data?.arrival_time ? data.arrival_time.split(':').map(Number) : [];

  const timeObjectDepartureTimeMin = { hourDepartureTimeMin, minuteDepartureTimeMin };
  const timeObjectArrivalTime = { hourArrivalTime, minuteArrivalTime };
  if (!dataTransportSaleDetail) return;

  return (
    <>
      <CmnModalHeader title='依頼条件の確認と修正' description={'キャリア側に依頼する条件の設定をしてください。'} />
      <CmnModalBody classNames='px-8 pt-8 text-foreground'>
        <div className='grid grid-cols-2'>
          <div className='col-span-1 flex flex-col gap-2'>
            <h3>現在の依頼条件</h3>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>便名</span>
              {!data ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{data.trip_name}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運送区間</span>
              {!data ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {' '}
                  {getPrefectureName(regions, data.departure_from)} ～ {getPrefectureName(regions, data.arrival_to)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運行日時</span>
              {!data ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{data.day && dayjs(data.day).format(DATE_FORMAT.JAPANESE)}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運行時間</span>
              {!data ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  出発時刻 {data.departure_time_max && formatTime(data.departure_time_max, TIME_FORMAT.HHMM)}〜 到着時刻{' '}
                  {data.arrival_time && formatTime(data.arrival_time, TIME_FORMAT.HHMM)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>温度帯</span>
              {!data ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{data.temperature_range && getCondition(data.temperature_range)}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>カットオフ時間</span>
              {!data ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {data.cut_off_time && data.cut_off_time + `時間前`} {data.cut_off_fee && data.cut_off_fee + '円'}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運賃</span>
              {!data ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {data.price && formatCurrency(String(data.price + (data.cut_off_fee || 0)))}円
                </span>
              )}
            </p>
          </div>
          <div className='col-span-1 flex flex-col gap-2'>
            <h3>修正・変更の適用</h3>
            <div className='p-2 border border-default rounded-lg flex flex-col gap-2'>
              <div className='flex gap-2 flex-nowrap items-center'>
                <p className='font-bold whitespace-nowrap'>運行開始日時</p>
                <CmnDatePicker
                  size='md'
                  variant='bordered'
                  className='w-[12.125rem]'
                  date={data?.day}
                  onChangeValue={(value: string) =>
                    setDataPropose((prev: any) =>
                      prev
                        ? {
                            ...prev,
                            departure_date: value,
                          }
                        : prev,
                    )
                  }
                />
              </div>
              <div className='flex gap-2 flex-nowrap items-center'>
                <p className='font-bold whitespace-nowrap'>運行終了日時</p>
                <CmnDatePicker
                  variant='bordered'
                  className='w-[12.125rem]'
                  date={data?.day}
                  onChangeValue={(value: string) =>
                    setDataPropose((prev: any) =>
                      prev
                        ? {
                            ...prev,
                            arrival_date: value,
                          }
                        : prev,
                    )
                  }
                />
              </div>
              <div className='flex gap-2 flex-nowrap items-center'>
                <p className='font-bold whitespace-nowrap'>出発時刻</p>
                <TimeInput
                  hourCycle={24}
                  className='w-[12.125rem]'
                  defaultValue={
                    new Time(
                      timeObjectDepartureTimeMin.hourDepartureTimeMin,
                      timeObjectDepartureTimeMin.minuteDepartureTimeMin,
                    )
                  }
                  variant='bordered'
                  onChange={(e) =>
                    setDataPropose((prev: any) =>
                      prev
                        ? {
                            ...prev,
                            departure_time_min: e?.toString(),
                          }
                        : prev,
                    )
                  }
                />
              </div>
              <div className='flex gap-2 flex-nowrap items-center'>
                <p className='font-bold whitespace-nowrap'>到着時刻</p>
                <TimeInput
                  hourCycle={24}
                  className='w-[12.125rem]'
                  defaultValue={
                    new Time(timeObjectArrivalTime.hourArrivalTime, timeObjectArrivalTime.minuteArrivalTime)
                  }
                  variant='bordered'
                  onChange={(e) =>
                    setDataPropose((prev: any) =>
                      prev
                        ? {
                            ...prev,
                            arrival_time: e?.toString(),
                          }
                        : prev,
                    )
                  }
                />
              </div>
              <div className='flex gap-2 flex-nowrap items-center'>
                <p className='font-bold whitespace-nowrap'>カットオフ時間</p>
                <CmnDropdown
                  classNameWrap='!min-w-[9.8375rem] w-[9.8375rem]'
                  size='sm'
                  classNameSelect='!h-[35px]'
                  defaultSelectedKeys={[
                    (dataItem && dataItem.cut_off_info_id && dataItem.cut_off_info_id.toString()) || '選択',
                  ]}
                  onChange={(e) => handleSelectCutOffInfos(Number(e.target.value))}
                  placeholder='選択'
                  items={itemDropdowns}
                />
              </div>
              <div className='flex gap-2 flex-nowrap items-center'>
                <p
                  className={`font-bold whitespace-nowrap ${data.price !== dataTransportSaleDetail?.price ? 'text-danger' : ''}`}
                >
                  希望運賃
                </p>
                <CmnInput
                  classNameInput='w-[11rem]'
                  defaultValue={dataPropose.price && formatCurrency(String(data.price + (data.cut_off_fee || 0)))}
                  onChange={(e) =>
                    setDataPropose((prev: any) =>
                      prev
                        ? {
                            ...prev,
                            price: convertCurrencyToNumber(e.target.value),
                          }
                        : prev,
                    )
                  }
                />
              </div>
              <Button size='sm' className='h-12 w-[9.25rem] self-end' color='primary' radius='sm' onPress={handleApply}>
                変更内容を適用
              </Button>
            </div>
          </div>
        </div>
      </CmnModalBody>
      <CmnModalFooter
        classNames='p-8'
        buttonRightFirst={{
          children: 'この条件で輸送を依頼する',
          className: 'w-[14.5rem]',
          color: 'primary',
          onPress: () => onSubmit(data),
        }}
        buttonLeftFirst={{
          children: '閉じる',
          className: 'border-none bg-background underline font-bold',
          onPress: onClose,
        }}
      />
    </>
  );
};

export default ModalConfirmRequest;
