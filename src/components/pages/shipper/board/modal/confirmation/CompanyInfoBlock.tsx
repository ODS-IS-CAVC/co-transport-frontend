'use client';

import { Button } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC } from 'react';

import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { OrderStatus, TRANS_EVENT } from '@/constants/transaction';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { getPrefectureName } from '@/lib/prefectures';
import { formatCurrency, formatCutOffTime, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface CompanyInfoBlockProps {
  data?: IDetailTransaction;
  eventCompanyInfo: () => void;
  eventAccept?: (type: string) => void;
  eventDeny?: (type: string) => void;
}

const CompanyInfoBlock: FC<CompanyInfoBlockProps> = ({ data, eventCompanyInfo, eventAccept, eventDeny }) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);
  if (!data) return;

  const { request_snapshot: requestData, propose_snapshot: proposeData, negotiation_data: negotiationData } = data;
  const prefectureFrom = getPrefectureName(regions, data.departure_from) || '';
  const prefectureTo = getPrefectureName(regions, data.arrival_to) || '';
  const carInfoTransaction = data.car_info && data.car_info.find((c) => c.is_matched);

  const getTransportDate = () => {
    if (negotiationData?.shipper?.arrival_date) {
      return dayjs(negotiationData?.shipper?.arrival_date).format(DATE_FORMAT.JAPANESE);
    }
    if (data.transport_date) {
      return dayjs(data.transport_date).format(DATE_FORMAT.JAPANESE);
    }

    return requestData?.collection_date ? dayjs(requestData.collection_date).format(DATE_FORMAT.JAPANESE) : '';
  };

  const getTransportTimeFrom = () => {
    if (negotiationData?.shipper?.collection_time_from) {
      return formatTime(negotiationData?.shipper?.collection_time_from);
    }
    if (data.request_collection_time_from) {
      return formatTime(data.request_collection_time_from);
    }
    return requestData?.collection_time_from ? formatTime(requestData.collection_time_from) : '';
  };

  const getTransportTimeTo = () => {
    if (negotiationData?.shipper?.collection_time_to) {
      return formatTime(negotiationData?.shipper?.collection_time_to);
    }
    if (data.request_collection_time_to) {
      return formatTime(data.request_collection_time_to);
    }
    return requestData?.collection_time_to ? formatTime(requestData.collection_time_to) : '';
  };

  return (
    <div className='flex flex-col gap-3 p-8 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col text-sm h-full font-normal leading-5 gap-2 w-[46%]'>
          <p className='font-bold'>予約内容</p>
          <p>
            <span className='font-bold'>運送会社:</span> &nbsp;
            <span>{data.carrier_operator_name}</span>
          </p>
          <p>
            <span className='font-bold'>便:</span> &nbsp;
            <span> {proposeData?.trip_name || ''}</span>
          </p>
          <p>
            <span className='font-bold'>運送区間:</span> &nbsp;
            <span>
              {prefectureFrom} ～ {prefectureTo}
            </span>
          </p>
          <p>
            <span className='font-bold'>運送時間:</span> &nbsp;
            <span>
              出発時刻{' '}
              {(proposeData?.departure_time_max && formatTime(proposeData.departure_time_max, TIME_FORMAT.HHMM)) || ''}{' '}
              ～ 到着時刻 {(proposeData.arrival_time && formatTime(proposeData.arrival_time, TIME_FORMAT.HHMM)) || ''}
            </span>
          </p>
          <p>
            <span className='font-bold'>車両:</span> &nbsp;
            <span>{carInfoTransaction?.trailer_license_plt_num_id || ''}</span>
          </p>
          <p>
            <span className='font-bold'>温度帯:</span> &nbsp;
            <span>{(proposeData?.temperature_range && getCondition(proposeData.temperature_range)) || '指定なし'}</span>
          </p>
          <p>
            <span className='font-bold'>運賃:</span> &nbsp;
            <span>
              {(proposeData && formatCurrency(String(proposeData?.price + (proposeData?.cut_off_fee || 0)))) || 0}円
            </span>
          </p>
          <p>
            <span className='font-bold'>カットオフ時間:</span> &nbsp;
            <span>
              {proposeData?.cut_off_time && `${formatCutOffTime(Number(proposeData?.cut_off_time))} `}{' '}
              {`${handleFormatNumberToCurrency(proposeData?.cut_off_fee ?? 0)}円`}
            </span>
          </p>
        </div>
        <Button
          className='rounded-lg border border-primary text-base text-primary font-bold w-[11.375rem] h-12 text-white'
          color='primary'
          onPress={eventCompanyInfo}
        >
          運送会社情報を見る
        </Button>
        <div className='flex flex-col flex-grow text-sm h-full font-normal leading-5 gap-2'>
          <p className='font-bold'>登録された輸送計画</p>
          <p>
            <span className='font-bold'>荷主:</span> &nbsp;
            <span>{data.shipper_operator_name}</span>
          </p>
          <p>
            <span className='font-bold'>荷物:</span> &nbsp;
            <span>{requestData?.transport_name}</span>
          </p>
          <p>
            <span className='font-bold'>運送区間:</span> &nbsp;
            <span>
              {prefectureFrom} ～ {prefectureTo}
            </span>
          </p>
          <p>
            <span className='font-bold'>温度帯:</span> &nbsp;
            <span>{(requestData?.temperature_range && getCondition(requestData.temperature_range)) || '指定なし'}</span>
          </p>
          <p>
            <span className='font-bold'>希望運送日時:</span> &nbsp;
            <span>{`${getTransportDate()} ${getTransportTimeFrom()}-${getTransportTimeTo()}`}</span>
          </p>
        </div>
      </div>

      <div className='flex flex-col gap-3'>
        {/* <Button
          className='rounded-lg border border-primary text-base text-primary font-bold self-end w-[9.25rem] h-12'
          color='primary'
          variant='bordered'
        >
          条件を編集する
        </Button> */}

        {data && [OrderStatus.WAIT_SHIPPER_APPROVE, OrderStatus.WAIT_SHIPPER_APPROVE_2].includes(data.status) && (
          <>
            <Button
              radius='sm'
              className='text-base text-primary font-bold w-[9.25rem] h-12 text-white self-end'
              color='primary'
              onPress={() => eventAccept && eventAccept(TRANS_EVENT.ACCEPT)}
            >
              予約を承諾する
            </Button>
            <Button
              radius='sm'
              className='text-base text-primary font-bold w-[10.3125rem] h-12 text-white self-end'
              color='primary'
              onPress={() => eventDeny && eventDeny(TRANS_EVENT.REJECT)}
            >
              予約を不承諾する
            </Button>
          </>
        )}

        {data && [OrderStatus.CARRIER_REJECTED, OrderStatus.SHIPPER_REJECTED].includes(data.status) && (
          <Button
            radius='sm'
            className='text-base text-primary font-bold w-[10.3125rem] h-12 text-white self-end'
            color='primary'
            onPress={() => eventAccept && eventAccept(TRANS_EVENT.RE_PROPOSAL)}
          >
            再提案
          </Button>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoBlock;
