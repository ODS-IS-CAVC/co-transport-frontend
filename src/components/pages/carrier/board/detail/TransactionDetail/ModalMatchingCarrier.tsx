'use client';

import { Button, Card, CardBody, Chip, Skeleton } from '@nextui-org/react';
import dayjs from 'dayjs';

import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatCutOffTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface MatchingCarrierModalProps {
  isOpen: boolean;
  data: IDetailTransaction[];
  parent: any;
  onClose: () => void;
  onViewCompanyInfo: (isCarrier: boolean, id: string) => void;
  onClickProposal: (trailers: any, dataDetailTransaction: IDetailTransaction) => void;
}

const ModalMatchingCarrier = (props: MatchingCarrierModalProps) => {
  const { isOpen, data, parent, onClose, onViewCompanyInfo, onClickProposal } = props;

  const regions = useAppSelector((state: RootState) => state.app.locations);

  const renderSkeleton = () => {
    const skeletonCount = data?.length || 1;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <div key={index} className='bg-white border border-default rounded-lg text-sm'>
        <div className='px-3 py-2'>
          <div className='flex space-x-2 mt-2 justify-end'>
            <Skeleton className='flex items-center justify-center text-base font-bold bg-other-gray w-44 h-6 rounded-lg' />
          </div>
          <div className='flex space-x-3 mt-2'>
            <Skeleton className='w-72 h-8 rounded' />
            <Skeleton className='w-40 h-8 rounded' />
            <Skeleton className='w-40 h-8 rounded' />
            <Skeleton className='w-40 h-8 rounded' />
          </div>
          <div className='flex justify-between px-2 py-1 gap-2'>
            <div className='flex items-center gap-2'>
              <Skeleton className='w-40 h-8 rounded' />
              <Skeleton className='w-64 h-8 rounded' />
              <Skeleton className='w-24 h-8 rounded' />
              <Skeleton className='w-40 h-8 rounded' />
            </div>
            <div className='flex gap-2'>
              <Skeleton className='rounded-lg text-base text-white w-[9.6875rem] h-12' />
              <Skeleton className='rounded-lg text-base text-white w-[9.6875rem] h-12' />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <CmnModal isOpen={isOpen} onClose={onClose} size='5xl'>
      <CmnModalHeader
        title={`マッチング${data.length || 0}件 - ${dayjs(parent?.transport_date).format(DATE_FORMAT.JAPANESE) || ''}  ${parent?.service_name || ''}`}
      />
      <CmnModalBody classNames='py-4'>
        <p className='text-xs pb-6'>
          {parent &&
            `${dayjs(parent.transport_date).format(DATE_FORMAT.JAPANESE) || ''}
            ${parent.service_name || ''}
            ${parent.trailer_license_plt_num_id || ''}
            トレクス トレーラにマッチングした運送能力の詳細です。`}
        </p>
        {!data && renderSkeleton()}
        {data &&
          data.map((item: any, index: any) => {
            const trailers = [item.trailer_1, item.trailer_2]
              .filter((trailer) => trailer && trailer?.matching_id !== null)
              .sort((a, b) => Number(a?.display_order) - Number(b?.display_order));
            return (
              <Card
                key={index}
                className='bg-white border border-default rounded-lg text-sm flex-shrink-0'
                shadow='none'
              >
                <CardBody className='px-3 py-2'>
                  <div className='flex justify-between mb-3'>
                    <Chip className='flex items-center justify-center text-base font-bold bg-[#555555] min-w-[165px] h-8 rounded-lg text-white'>
                      輸送計画に登録済み
                    </Chip>
                    <div className='flex text-foreground text-base gap-2'>
                      <span className='whitespace-nowrap flex gap-2'>
                        <p className='font-bold'>輸送日</p>
                        <p>{dayjs(item.service_strt_date).format(DATE_FORMAT.JAPANESE)}</p>
                      </span>
                    </div>
                  </div>
                  <div className='flex gap-4 mb-3 items-center'>
                    <div className='flex gap-3 items-center'>
                      <p className='text-base font-bold'>便名</p>
                      <p className='text-2xl font-medium'>{item.service_name || '沼津BA便'}</p>
                    </div>
                    <div className='flex items-center px-3 gap-3 border border-default rounded-lg'>
                      <p className='text-base font-bold'>出発</p>
                      <p className='text-2xl font-medium'>
                        {`${getPrefectureName(regions, item.departure_from)} ${item.service_strt_time ? dayjs(item?.service_strt_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM) : '--:--'}発`}
                      </p>
                      <Icon icon='keyboard_arrow_right' size={24} />
                      <p className='text-base font-bold'>到着</p>
                      <p className='text-2xl font-medium'>
                        {`${getPrefectureName(regions, item.arrival_to)} ${item.service_end_time ? dayjs(item.service_end_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM) : '--:--'}着`}
                      </p>
                    </div>
                  </div>
                  {trailers.length > 0 &&
                    trailers.map((trailer: any, _index: any) => (
                      <div className='mb-2'>
                        {_index === 0 && (
                          <div className='flex gap-3 mb-3 items-center'>
                            <p className='text-base font-bold'>運送会社</p>
                            <p className='text-2xl font-medium'>{trailer.carrier2_operator_name}</p>
                          </div>
                        )}
                        <div className='flex gap-3 mb-3 flex-wrap'>
                          <div className='flex items-center px-3 gap-6 border border-default rounded-lg'>
                            <p className='whitespace-nowrap flex gap-1 items-center'>
                              <span className='text-base font-bold'>車両</span>
                              <span className='text-2xl font-medium'>{trailer.vehicle_name}</span>
                            </p>
                            <p className='whitespace-nowrap flex gap-1 items-center'>
                              <span className='text-base font-bold'>タイプ</span>
                              <span className='text-2xl font-medium'>トレーラ</span>
                            </p>
                            <p className='whitespace-nowrap flex gap-1 items-center'>
                              <span className='text-base font-bold'>温度帯</span>
                              <span className='text-2xl font-medium'>
                                {trailer.temperature_range && getCondition(trailer.temperature_range)}
                              </span>
                            </p>
                            <p className='whitespace-nowrap flex gap-1 items-center'>
                              <span className='text-base font-bold'>車両ナンバー</span>
                              <span className='text-2xl font-medium'>{trailer.trailer_license_plt_num_id}</span>
                            </p>
                          </div>
                        </div>
                        <div className='flex justify-between items-end gap-2'>
                          <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-3'>
                              <span className='text-base font-bold'>運賃</span>
                              <span className='text-2xl font-medium'>
                                {currencyFormatWithIcon(Number(trailer.price) + Number(trailer.cut_off_fee))}
                              </span>
                            </div>
                            <div className='flex items-center gap-3'>
                              <span className='flex items-center gap-2'>
                                <span className='text-base font-bold'>カットオフ時間</span>
                                <span className='text-2xl font-medium'>
                                  {`${formatCutOffTime(Number(trailer.cut_off_time))} ${handleFormatNumberToCurrency(trailer.cut_off_fee ?? 0)}円`}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <Button
                              size='lg'
                              color='primary'
                              className='rounded-lg text-base min-w-[182px]'
                              onPress={() => onViewCompanyInfo(true, trailer.carrier2_operator_id)}
                            >
                              運送会社情報を見る
                            </Button>
                            <Button
                              size='lg'
                              color='primary'
                              className='rounded-lg text-base min-w-[98px]'
                              onPress={() => onClickProposal(trailer, parent)}
                            >
                              予約する
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </CardBody>
              </Card>
            );
          })}
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          children: '閉じる',
          onPress: onClose,
          className: 'border-none bg-background text-base text-primary font-bold',
        }}
      />
    </CmnModal>
  );
};

export default ModalMatchingCarrier;
