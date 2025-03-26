'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { CmnSelectableCard } from '@/components/common/CmnSelectableCard';
import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import DetailTransaction from '@/components/pages/carrier/board/Modal/DetailTransaction';
import Status from '@/components/pages/carrier/board/Status';
import { TransType } from '@/constants/common';
import { TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { formatDateWithWeekDayJapanese } from '@/lib/helper';
import { Matching, MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { gTxt } from '@/messages/gTxt';
import { RootState } from '@/redux/store';
import { ITrailer, ITransportMatching } from '@/types/carrier/transport';

interface ModalTransactionProps {
  open: boolean;
  active: ITrailer;
  item: ITransportMatching;
  onClose: () => void;
  onRefetch?: () => void;
}

const ModalDetailTransaction = ({
  active,
  item,
  open = false,
  onClose = () => null,
  onRefetch = () => null,
}: ModalTransactionProps) => {
  const [activeTrailer, setActiveTrailer] = useState(active);
  const [subTrailerId, setSubTrailerId] = useState<{ id: number | null; isFirstTrailer: boolean }>({
    id: null,
    isFirstTrailer: false,
  });
  const { truck, trailer_1, trailer_2 } = item;

  const [isChanged, setIsChanged] = useState(false);

  // Sort trailers by display_order and assign to array
  const trailers = [trailer_1, trailer_2].sort(
    (a, b) =>
      Number(!a.trailer_license_plt_num_id) - Number(!b.trailer_license_plt_num_id) ||
      Number(a.display_order) - Number(b.display_order),
  );
  const trailer1 = trailers[0] || {};
  const trailer2 = trailers[1] || {};

  useEffect(() => {
    setSubTrailerId(
      activeTrailer.order_id === trailer1.order_id
        ? { id: Number(trailer2.order_id), isFirstTrailer: false }
        : { id: Number(trailer1.order_id), isFirstTrailer: true },
    );
  }, [activeTrailer]);

  const regions = useAppSelector((state: RootState) => state.app.locations);

  const renderTitleTrailer = (trailer: ITrailer, status: { label: string; status: number; color: string }) => {
    return (
      <div className='flex justify-between items-center gap-2 w-full px-4'>
        <div className='flex flex-col justify-start items-start gap-2'>
          <p className='text-base font-medium'>{trailer.trailer_license_plt_num_id ?? ''}</p>
          <p className='text-base font-medium'>{`${trailer.vehicle_name ?? ''} ${getCondition(trailer.temperature_range)}`}</p>
        </div>
        <div className='flex gap-2'>
          <Status data={status} type={trailer.trans_type === TransType.CARRIER} />
        </div>
      </div>
    );
  };

  const renderTrailerDetail = () => {
    if (!activeTrailer.order_id) {
      return <div className='px-4 py-60 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>;
    }

    return (
      <DetailTransaction
        id={Number(activeTrailer.order_id)}
        subId={subTrailerId}
        type={activeTrailer.trans_type === TransType.CARRIER ? Matching.MATCHING_CARRIER : Matching.TRANSACTION_SHIPPER}
        setIsChanged={(flag) => setIsChanged(flag)}
      />
    );
  };

  const [activeTab, setActiveTab] = useState(active === trailer2 ? 'trailer2' : 'trailer1');

  const trailerSelect = trailers.map((trailer, index) => ({
    key: `trailer${index + 1}`,
    title: renderTitleTrailer(trailer, MatchingHelper.getTrailerStatus(trailer)),
    content: renderTrailerDetail(),
  }));

  return (
    <CmnModal isOpen={open} onClose={() => onClose()} size='5xl'>
      <CmnModalHeader
        title={`詳細情報 ${(item.service_strt_date && formatDateWithWeekDayJapanese(new Date(item.service_strt_date))) || ''}  ${item?.service_name}`}
        classNames='mb-0 px-8 pt-8'
        classNamesTitle='mb-8'
      />
      <CmnModalBody classNames='px-8 pt-0 gap-0'>
        <p className='text-sm'>{`${truck?.vehicle_name ?? ''} ${truck?.car_license_plt_num_id ?? ''}`}</p>
        <div className='flex gap-2'>
          <div className='flex items-center gap-2'>
            <p className='text-base font-bold'>便名</p>
            <p className='text-2xl font-medium'>{item.service_name}</p>
          </div>
          <div className='flex items-center px-2 py-1 gap-3 border border-default rounded-lg'>
            <p className='text-base font-bold'>出発</p>
            <p className='text-2xl font-medium'>
              {`${getPrefectureName(regions, +item.departure_from)} ${
                item.service_strt_time
                  ? dayjs(item?.service_strt_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)
                  : '--:--'
              }発`}
            </p>
            <Icon icon='keyboard_arrow_right' size={24} />
            <p className='text-base font-bold'>到着</p>
            <p className='text-2xl font-medium'>
              {`${getPrefectureName(regions, +item.arrival_to)} ${
                item.service_end_time
                  ? dayjs(item.service_end_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)
                  : '--:--'
              }着`}
            </p>
          </div>
        </div>
        <span className='text-foreground  font-bold text-sm my-4'>トレーラ選択</span>
        {/* <Tabs */}
        <CmnSelectableCard
          items={trailerSelect}
          value={activeTab}
          onSelectionChange={(key) => {
            setActiveTab(key);
            setActiveTrailer(key === 'trailer1' ? trailer1 : trailer2);
          }}
        />
      </CmnModalBody>
      <CmnModalFooter
        buttonRightFirst={{
          children: '便詳細を見る',
          className: 'text-base text-primary font-bold min-w-[8.5rem] px-8 py-4 text-white',
          onPress: () => {
            onClose();
            isChanged && onRefetch();
          },
        }}
        buttonLeftFirst={{
          children: '確定ボードへ戻る',
          className: 'bg-background text-base border-none text-primary font-bold min-w-[8.5rem] px-8 py-4',
          onPress: () => {
            onClose();
            isChanged && onRefetch();
          },
        }}
      />
    </CmnModal>
  );
};

export default ModalDetailTransaction;
