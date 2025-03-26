'use client';

import { Skeleton } from '@nextui-org/react';
import dayjs from 'dayjs';

import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { formatCurrency, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { ITransportMatching } from '@/types/shipper/transport';

interface ModalDetailMatchingTransportProps {
  onClose: () => void;
  onSubmit: (id: number) => void;
  dataItem?: ITransportMatching;
}

const ModalDetailMatchingTransport = ({ onClose, onSubmit, dataItem }: ModalDetailMatchingTransportProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);

  return (
    <>
      <CmnModalHeader
        title='マッチした運送能力詳細'
        description={'マッチした運送能力とキャリア側会社情報の詳細です。'}
      />
      <CmnModalBody classNames='px-8 pt-8 text-foreground'>
        <div className='grid grid-cols-2'>
          <div className='col-span-1 flex flex-col gap-2'>
            <h3>会社情報</h3>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>会社名</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem.carrier_operator_name}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>住所</span>
              <span className='font-normal'></span> {/* TODO */}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>担当者</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem.road_carr_depa_sped_org_name_txt}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>所属</span>
              <span className='font-normal'></span> {/* TODO */}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>電話番号</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem.trsp_cli_tel_cmm_cmp_num_txt}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>メールアドレス</span>
              <span className='font-normal'></span> {/* TODO */}
            </p>
          </div>
          <div className='col-span-1 flex flex-col gap-2'>
            <h3>運行情報</h3>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>便名</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem.propose_snapshot.trip_name}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運送区間</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {' '}
                  {getPrefectureName(regions, dataItem.propose_snapshot.departure_from)} ～{' '}
                  {getPrefectureName(regions, dataItem.propose_snapshot.arrival_to)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運行日時</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {dataItem.propose_snapshot.day && dayjs(dataItem.propose_snapshot.day).format(DATE_FORMAT.JAPANESE)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運行時間</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  出発時刻{' '}
                  {dataItem.propose_snapshot &&
                    dataItem.propose_snapshot.departure_time_max &&
                    formatTime(dataItem.propose_snapshot.departure_time_max, TIME_FORMAT.HHMM)}
                  〜 到着時刻{' '}
                  {dataItem.propose_snapshot &&
                    dataItem.propose_snapshot.arrival_time &&
                    formatTime(dataItem.propose_snapshot.arrival_time, TIME_FORMAT.HHMM)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>温度帯</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {dataItem.propose_snapshot.temperature_range &&
                    getCondition(dataItem.propose_snapshot.temperature_range)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>カットオフ時間</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {dataItem.propose_snapshot.cut_off_time && dataItem.propose_snapshot.cut_off_time + `時間前`}{' '}
                  {dataItem.propose_snapshot.cut_off_fee && dataItem.propose_snapshot.cut_off_fee + '円'}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運賃</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {formatCurrency(
                    String(dataItem.propose_snapshot.price + (dataItem.propose_snapshot?.cut_off_fee || 0)),
                  )}
                  円
                </span>
              )}
            </p>
          </div>
        </div>
      </CmnModalBody>
      <CmnModalFooter
        classNames='p-8'
        buttonRightFirst={{
          children: '依頼条件を設定',
          className: 'w-[9.25rem]',
          color: 'primary',
          onPress: () => dataItem && onSubmit(Number(dataItem.propose_snapshot.vehicle_avb_resource_id)),
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

export default ModalDetailMatchingTransport;
