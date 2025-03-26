'use client';

import { Button, Skeleton } from '@nextui-org/react';
import dayjs from 'dayjs';

import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import { TransType } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { OUT_PACKAGES } from '@/constants/shipper';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { ITransportPlanSale, ITransportShipperSearch } from '@/types/shipper/transport';

import RecordItemMatching from './RecordItemMatching';

interface ModalDataProposeProps {
  onClose: () => void;
  onSubmit: () => void;
  checkDetailMatching: (id: number) => void;
  dataItem?: ITransportShipperSearch[];
  dataTransportSaleDetail?: ITransportPlanSale;
}

const ModalDataPropose = ({
  onClose,
  onSubmit,
  dataItem,
  checkDetailMatching,
  dataTransportSaleDetail,
}: ModalDataProposeProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const collectionDate =
    dataTransportSaleDetail?.trans_type === TransType.CARRIER
      ? dataTransportSaleDetail?.transport_date
      : dataTransportSaleDetail?.collection_date;
  const price =
    dataTransportSaleDetail?.trans_type === TransType.CARRIER
      ? dataTransportSaleDetail?.propose_price
      : dataTransportSaleDetail?.price_per_unit;
  const timeFrom =
    dataTransportSaleDetail?.trans_type === TransType.CARRIER
      ? dataTransportSaleDetail?.propose_depature_time
      : dataTransportSaleDetail?.collection_time_from;
  const timeTo =
    dataTransportSaleDetail?.trans_type === TransType.CARRIER
      ? dataTransportSaleDetail?.propose_arrival_time
      : dataTransportSaleDetail?.collection_time_to;

  return (
    <>
      <CmnModalBody classNames='px-8 pt-8'>
        <h1 className='text-foreground'>条件の近い空便を検索</h1>
        <p className='text-foreground text-[28px]'>荷物情報詳細</p>
        <div className='px-6 my-1 flex justify-between text-foreground text-base gap-2'>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>荷物ID</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.operator_code || 0}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>品名</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.transport_name}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>品目</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as='span' className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {OUT_PACKAGES.find((op) => op.key === dataTransportSaleDetail.outer_package_code?.toString())?.label}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>全長</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.total_length || 0}cm</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>全幅</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.total_width || 0}cm</span>
              )}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>全高</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.total_height || 0}cm</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>重量</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.weight || 0}t</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>温度帯</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {dataTransportSaleDetail.temperatureRange && getCondition(dataTransportSaleDetail.temperatureRange)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>備考</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.special_instructions}</span>
              )}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>輸送計画ID</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataTransportSaleDetail.transport_code}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運賃</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{price && currencyFormatWithIcon(price)}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>出発地</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {getPrefectureName(regions, dataTransportSaleDetail.departure_from)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>経由地</span>
              <span className='font-normal'>なし</span> {/* TODO */}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>到着地</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{getPrefectureName(regions, dataTransportSaleDetail.arrival_to)}</span>
              )}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>輸送日時</span>
              {!dataTransportSaleDetail ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {collectionDate && dayjs(collectionDate).format(DATE_FORMAT.DEFAULT)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold'>基本持込期限(カットオフ)</span>
              <span className='font-normal'>
                {timeFrom && formatTime(timeFrom, TIME_FORMAT.HHMM)} ~ {timeTo && formatTime(timeTo, TIME_FORMAT.HHMM)}
              </span>
            </p>
          </div>
        </div>
        <div className='flex gap-2 justify-end mt-4'>
          <Button className='text-neutral w-[12.375rem] font-bold h-12 text-base' size='sm' color='primary' radius='sm'>
            荷物情報の詳細を確認
          </Button>
          <Button className='text-neutral w-[12.375rem] font-bold h-12 text-base' size='sm' color='primary' radius='sm'>
            輸送計画の詳細を確認
          </Button>
        </div>
        <h1 className='text-foreground'>条件の近い空便 - {dataItem?.length || 0}件</h1>
        <p className='text-[#757575] my-1 text-[12px]'>マッチングしていない空便情報(運送能力)の表示結果です。</p>
        {dataItem &&
          dataItem.length > 0 &&
          dataItem.map((item: any, rowIndex: number) => (
            <RecordItemMatching dataItem={item} key={rowIndex} checkDetailMatching={checkDetailMatching} />
          ))}
      </CmnModalBody>
      <CmnModalFooter
        classNames='px-8 pb-8'
        buttonLeftFirst={{
          children: '閉じる',
          className: 'border-none bg-background underline font-bold',
          onPress: onClose,
        }}
      />
    </>
  );
};

export default ModalDataPropose;
