'use client';

import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useCallback } from 'react';

import { Icon } from '@/components/common/Icon';
import { OUTER_PACKAGE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
// import { getMatchingStatus } from '@/lib/carrier';
import { MatchingHelper } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';
import { CombinedTransactionDetail, ITransactionShipper } from '@/types/shipper/transaction';
import { ITransportMatching } from '@/types/shipper/transport';

interface ItemProps {
  // isPage = negotiation type ITransportMatching | isPage = confirm type is ITransactionShipper
  dataItem?: ITransportMatching | ITransactionShipper | CombinedTransactionDetail | IDetailTransaction;
  showDetail?: (id: number) => void;
  showDetailMatching?: (id: number) => void;
  isModal?: boolean;
  isDetailMatching?: boolean;
  totalMatching?: number;
  isNegotiationPage?: boolean;
  isDetailTab?: boolean;
}

const Item = ({
  dataItem,
  showDetail,
  isModal,
  totalMatching,
  isDetailMatching,
  isNegotiationPage,
  showDetailMatching,
  isDetailTab,
}: ItemProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const matchingStatus =
    dataItem &&
    (isNegotiationPage
      ? MatchingHelper.getMatchingStatus(dataItem.status, dataItem?.total || totalMatching)
      : MatchingHelper.getOrderStatus(dataItem.status, 'shipper'));

  const isNegotiationPageType = (item: any): item is ITransportMatching => {
    return isNegotiationPage && item;
  };

  const getNaviTime = useCallback(() => {
    const collectionTime = isNegotiationPageType(dataItem)
      ? dataItem?.request_snapshot?.collection_time_to
      : dataItem?.request_collection_time_to;
    if (!collectionTime) return '';
    const startTime = dayjs(collectionTime, TIME_FORMAT.HHMM).add(1.5, 'hour');
    const endTime = startTime.add(3, 'hour');
    return `${startTime.format(TIME_FORMAT.HH_MM)} - ${endTime.format(TIME_FORMAT.HH_MM)}`;
  }, [dataItem]);

  return (
    <Card className={`w-full rounded-lg flex-shrink-0 ${!isModal ? 'border border-gray-border' : ''}`} shadow='none'>
      <CardHeader className={`flex items-center justify-between text-sm pb-0 p-2 gap-2 ${isModal ? 'px-0' : ''}`}>
        <Button
          className={`text-base text-neutral font-bold h-8 rounded-lg leading-normal tracking-wide flex-shrink-0 ${!isNegotiationPage && 'pointer-events-none'} ${matchingStatus?.color}`}
          onPress={() =>
            isNegotiationPageType(dataItem) &&
            showDetailMatching &&
            dataItem &&
            showDetailMatching(dataItem.cns_line_item_by_date_id)
          }
        >
          {matchingStatus?.label}
        </Button>
        <div className='flex gap-2 text-foreground text-sm font-normal flex-wrap'>
          <div className={`whitespace-nowrap ${isModal && 'hidden'}`}>
            <span className='font-bold'>荷主</span> &nbsp;
            <span>{dataItem?.shipper_operator_name}</span>
          </div>
          <div className={`${(isDetailMatching || isNegotiationPage) && 'hidden'} whitespace-nowrap flex`}>
            <span className='font-bold'>事業者</span> &nbsp;
            <span>{dataItem?.carrier_operator_name}</span>
          </div>
          <div className='whitespace-nowrap flex'>
            <span className='font-bold'>登録日</span> &nbsp;
            {dataItem?.created_date && dayjs(dataItem.created_date).format(DATE_FORMAT.JAPANESE_DATE)}
          </div>
        </div>
      </CardHeader>
      <CardBody className={`pb-2 pt-0 flex flex-col ${isModal ? 'gap-2 px-0' : 'gap-2 px-2'}`}>
        <div className='text-foreground tracking-wide flex items-center gap-2'>
          <span className='text-sm leading-tight font-bold'>品名</span> &nbsp;
          <span className='text-2xl leading-9 font-medium'>{dataItem?.request_snapshot?.transport_name}</span>
          <span className='text-sm leading-tight font-bold'>品目</span> &nbsp;
          <span className='text-2xl leading-9 font-medium'>
            {dataItem?.request_snapshot
              ? OUTER_PACKAGE.find((outer) => outer.key === `${dataItem.request_snapshot.outer_package_code}`)?.label
              : ''}
          </span>
        </div>
        <div className={`flex flex-wrap items-center ${isModal ? 'gap-2' : 'gap-4'}`}>
          <div className={`flex items-center gap-[20px] ${isModal ? 'w-full' : ''}`}>
            <div
              className={`border-default border rounded-lg flex flex-col justify-center items-center h-[4.5rem] px-4 ${isModal ? 'w-full' : 'w-[17.5rem]'}`}
            >
              <div className='text-base font-normal leading-7 tracking-wide flex gap-4'>
                <span className='text-foreground whitespace-nowrap'>
                  {dataItem?.request_snapshot?.collection_date &&
                    dayjs(dataItem.request_snapshot.collection_date).format(DATE_FORMAT.JAPANESE_DATE)}
                </span>
                <div className='text-foreground flex gap-2 whitespace-nowrap'>
                  {dataItem?.request_snapshot &&
                    (isNegotiationPageType(dataItem)
                      ? dataItem.request_snapshot.collection_time_from
                      : dataItem.request_collection_time_from) &&
                    formatTime(
                      isNegotiationPageType(dataItem)
                        ? dataItem.request_snapshot.collection_time_from
                        : dataItem.request_collection_time_from,
                      TIME_FORMAT.HHMM,
                    )}
                  -{' '}
                  {dataItem?.request_snapshot &&
                    (isNegotiationPageType(dataItem)
                      ? dataItem.request_snapshot.collection_time_to
                      : dataItem.request_collection_time_to) &&
                    formatTime(
                      isNegotiationPageType(dataItem)
                        ? dataItem.request_snapshot.collection_time_to
                        : dataItem.request_collection_time_to,
                      TIME_FORMAT.HHMM,
                    )}
                </div>
              </div>
              <p className='text-foreground text-2xl font-medium leading-9 tracking-wide'>
                {dataItem?.departure_from && getPrefectureName(regions, dataItem.departure_from)}
              </p>
            </div>
            <Icon icon='keyboard_arrow_right' className='text-[#5A5A5A]' size={24} />
            <div
              className={`border-default border rounded-lg flex flex-col justify-center items-center h-[4.5rem] px-4 ${isModal ? 'w-full' : 'w-[17.5rem]'}`}
            >
              <div className='text-base font-normal leading-7 tracking-wide flex gap-4'>
                <span className='text-foreground whitespace-nowrap'>
                  {dataItem?.request_snapshot?.collection_date &&
                    dayjs(dataItem.request_snapshot.collection_date).format(DATE_FORMAT.JAPANESE_DATE)}
                </span>
                <div className='text-foreground flex gap-2 whitespace-nowrap'>{getNaviTime()}</div>
              </div>

              <p className='text-foreground text-2xl font-medium leading-9 tracking-wide'>
                {dataItem?.arrival_to && getPrefectureName(regions, dataItem.arrival_to)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 whitespace-nowrap'>
            <span className={`text-foreground ${isModal ? 'font-normal' : 'font-bold'} text-sm`}>運賃</span>
            <span className={`${isModal ? 'text-primary' : 'text-foreground'} font-medium text-2xl`}>
              {dataItem?.request_snapshot
                ? currencyFormatWithIcon(
                    isNegotiationPageType(dataItem) ? dataItem.request_snapshot.price_per_unit : dataItem.request_price,
                  )
                : ''}
            </span>
          </div>
          {!isDetailTab && (
            <Button
              className={`text-neutral w-[7.1875rem] h-12 font-bold ml-auto text-base self-end flex-shrink-0 ${isModal && 'hidden'}`}
              size='sm'
              color='primary'
              radius='sm'
              onPress={() =>
                showDetail &&
                dataItem &&
                showDetail(isNegotiationPageType(dataItem) ? dataItem.cns_line_item_by_date_id : dataItem.id)
              }
            >
              詳細を見る
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default Item;
