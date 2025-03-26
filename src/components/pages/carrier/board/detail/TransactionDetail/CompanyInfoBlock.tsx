'use client';

import { Button } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC } from 'react';

import { DATE_FORMAT } from '@/constants/constants';
import { OrderStatus, TRANS_EVENT } from '@/constants/transaction';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { handleFormatNumberToCurrency } from '@/lib/helper';
import { Matching } from '@/lib/matching';
import { getPrefectureName } from '@/lib/prefectures';
import { formatCurrency, formatCutOffTime, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface CompanyInfoBlockProps {
  data: IDetailTransaction;
  type: number;
  eventCompanyInfo: (isCarrier: boolean) => void;
  eventAccept?: (type: string) => void;
  eventDeny?: (type: string) => void;
}

const CompanyInfoBlock: FC<CompanyInfoBlockProps> = ({ data, type, eventAccept, eventCompanyInfo, eventDeny }) => {
  const { request_snapshot: requestData, propose_snapshot: proposeData, negotiation_data: negotiationData } = data;
  const regions = useAppSelector((state: RootState) => state.app.locations);
  const isMatchingCarrier = type === Matching.MATCHING_CARRIER;

  const prefectureFrom = getPrefectureName(regions, data.departure_from) || '';
  const prefectureTo = getPrefectureName(regions, data.arrival_to) || '';
  const carInfoTransaction = data.car_info && data.car_info.find((c) => c.is_matched);

  const temperatureRequest =
    (requestData?.temperature_range && getCondition(requestData.temperature_range)) || '指定なし';
  const temperaturePropose =
    (proposeData?.temperature_range && getCondition(proposeData.temperature_range)) || '指定なし';

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

  const isCarrierProposal =
    ([OrderStatus.WAIT_CARRIER_CONFIRM_3, OrderStatus.WAIT_CARRIER_CONFIRM_4].includes(data.status) &&
      data.is_request_carrier) ||
    ([OrderStatus.WAIT_CARRIER_CONFIRM, OrderStatus.WAIT_CARRIER_CONFIRM_2].includes(data.status) &&
      !data.is_request_carrier);

  const isCarrierRequest =
    ([OrderStatus.WAIT_CARRIER_CONFIRM, OrderStatus.WAIT_CARRIER_CONFIRM_2].includes(data.status) &&
      data.is_request_carrier) ||
    ([OrderStatus.WAIT_CARRIER_CONFIRM_3, OrderStatus.WAIT_CARRIER_CONFIRM_4].includes(data.status) &&
      !data.is_request_carrier);

  const isCarrierReProposal =
    [OrderStatus.CARRIER_CARRIER_REJECTED].includes(data.status) ||
    [OrderStatus.CARRIER_SHIPPER_REJECTED].includes(data.status);

  const isShipperReProposal =
    [OrderStatus.CARRIER_REJECTED].includes(data.status) || [OrderStatus.SHIPPER_REJECTED].includes(data.status);

  const CarrierCarrier = () => {
    return (
      <div className='flex flex-row'>
        <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1'>
          <h6 className='font-bold'>予約内容</h6>
          <div className='flex flex-col gap-1 mb-6'>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運送会社:</span>
              <span>{data.carrier_operator_name}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>便:</span>
              <span>{data.trip_name || ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運送区間:</span>
              <span>
                {prefectureFrom} ～ {prefectureTo}
              </span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運送時間:</span>
              <span>
                出発時刻 {data.propose_departure_time ? formatTime(data.propose_departure_time) : ''} ～ 到着時刻{' '}
                {data.propose_arrival_time ? formatTime(data.propose_arrival_time) : ''}
              </span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>車両:</span>
              <span>{carInfoTransaction?.trailer_license_plt_num_id || ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>温度帯:</span>
              <span>{temperatureRequest}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運賃:</span>
              <span>{`${(data.propose_price && formatCurrency(String(data.propose_price + (proposeData?.cut_off_fee || 0)))) || 0}円`}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>カットオフ時間:</span>
              <span>
                {proposeData?.cut_off_time && `${formatCutOffTime(Number(proposeData?.cut_off_time))} `}{' '}
                {`${handleFormatNumberToCurrency(proposeData?.cut_off_fee ?? 0)}円`}
              </span>
            </div>
          </div>
          {/* ========= */}
          <div className='flex flex-col gap-1'>
            <h6 className='font-bold'>運行内容</h6>
            <div className='flex flex-col gap-1 mb-6'>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>運送会社:</span>
                <span>{data.carrier2_operator_name}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>便:</span>
                <span>{proposeData?.trip_name}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>運送区間:</span>
                <span>
                  {prefectureFrom} ～ {prefectureTo}
                </span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>運送時間:</span>
                <span>
                  出発時刻 {data?.departure_time ? formatTime(data.departure_time) : ''} ～ 到着時刻{' '}
                  {data?.arrival_time ? formatTime(data.arrival_time) : ''}
                </span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>車両:</span>
                <span>{data.trailer_license_plt_num_id || ''}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>温度帯:</span>
                <span>{temperaturePropose}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>運賃:</span>
                <span>{`${(proposeData?.price && formatCurrency(String(proposeData?.price + (proposeData?.cut_off_fee || 0)))) || 0}円`}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>カットオフ時間:</span>
                <span>
                  {proposeData?.cut_off_time && `${formatCutOffTime(Number(proposeData?.cut_off_time))} `}{' '}
                  {`${handleFormatNumberToCurrency(proposeData?.cut_off_fee ?? 0)}円`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CarrierShipper = () => {
    return (
      <div className='flex flex-row'>
        <div className='flex flex-col text-sm h-full font-normal leading-5 gap-1'>
          <h6 className='font-bold'>予約内容</h6>
          <div className='flex flex-col gap-1 mb-6'>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運送会社:</span>
              <span>{data.carrier_operator_name}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>便:</span>
              <span>{proposeData?.trip_name || ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運送区間:</span>
              <span>
                {prefectureFrom} ～ {prefectureTo}
              </span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運送時間:</span>
              <span>
                出発時刻 {data?.departure_time && formatTime(data?.departure_time)} ～ 到着時刻{' '}
                {data?.arrival_time && formatTime(data?.arrival_time)}
              </span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>車両:</span>
              <span>{carInfoTransaction?.trailer_license_plt_num_id || ''}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>温度帯:</span>
              <span>{temperaturePropose}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>運賃:</span>
              <span>{`${(proposeData?.price && formatCurrency(String(proposeData?.price + (proposeData?.cut_off_fee || 0)))) || 0}円`}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-bold w-32'>カットオフ時間:</span>
              <span>
                {proposeData?.cut_off_time && `${formatCutOffTime(Number(proposeData?.cut_off_time))} `}{' '}
                {`${handleFormatNumberToCurrency(proposeData?.cut_off_fee ?? 0)}円`}
              </span>
            </div>
          </div>
          {/* =========== */}
          <div className='flex flex-col gap-1'>
            <h6 className='font-bold'>登録された輸送計画</h6>
            <div className='flex flex-col gap-1 mb-6'>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>荷主:</span>
                <span>{data.shipper_operator_name}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>荷物:</span>
                <span>{requestData?.transport_name}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>運送区間:</span>
                <span>
                  {prefectureFrom} ～ {prefectureTo}
                </span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>温度帯:</span>
                <span>{temperatureRequest}</span>
              </div>
              <div className='flex gap-2'>
                <span className='font-bold w-32'>希望運送日時:</span>
                <span>{`${getTransportDate()} ${getTransportTimeFrom()}-${getTransportTimeTo()}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className='flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
      <div className='px-6 py-4'>
        <h2 className='mb-4'>1.予約</h2>

        {isMatchingCarrier ? CarrierCarrier() : CarrierShipper()}

        <div className='flex flex-col gap-3'>
          <div className='flex justify-end'>
            <Button
              className='rounded-lg text-base font-bold min-w-[8.5rem] h-12 px-8 py-4'
              color='primary'
              variant='bordered'
              radius='sm'
              onPress={() => eventCompanyInfo(isMatchingCarrier)}
            >
              {isMatchingCarrier ? '運送会社情報を見る' : '荷主会社情報を見る'}
            </Button>
          </div>
          <div className='flex justify-end gap-3'>
            {[
              OrderStatus.WAIT_CARRIER_APPROVE,
              OrderStatus.WAIT_CARRIER_APPROVE_2,
              OrderStatus.WAIT_SHIPPER_APPROVE,
              OrderStatus.WAIT_SHIPPER_APPROVE_2,
            ].includes(data.status) && (
              <div className='self-end'>
                {[OrderStatus.WAIT_CARRIER_APPROVE, OrderStatus.WAIT_CARRIER_APPROVE_2].includes(data.status) && (
                  <Button
                    className='text-base font-bold min-w-[8.5rem] h-12 lg:px-8 md:px-4 py-4'
                    color='primary'
                    radius='sm'
                    onPress={() => eventAccept && eventAccept(TRANS_EVENT.ACCEPT)}
                  >
                    予約を承諾する
                  </Button>
                )}
                {[OrderStatus.WAIT_SHIPPER_APPROVE, OrderStatus.WAIT_SHIPPER_APPROVE_2].includes(data.status) && (
                  <Button
                    className='text-base font-bold min-w-[8.5rem] h-12 lg:px-8 md:px-4 py-4'
                    color='danger'
                    variant='bordered'
                    radius='sm'
                    onPress={() => eventDeny && eventDeny(TRANS_EVENT.CANCEL)}
                  >
                    提案を取り消す
                  </Button>
                )}
              </div>
            )}

            {[OrderStatus.WAIT_CARRIER_APPROVE, OrderStatus.WAIT_CARRIER_APPROVE_2].includes(data.status) && (
              <div className='flex justify-end'>
                <Button
                  className='text-base font-bold min-w-[8.5rem] h-12 lg:px-8 md:px-4 py-4'
                  color='danger'
                  variant='bordered'
                  radius='sm'
                  onPress={() => eventDeny && eventDeny(TRANS_EVENT.REJECT)}
                >
                  予約を不承諾する
                </Button>
              </div>
            )}

            {isCarrierProposal && (
              <>
                {[
                  { event: eventDeny, action: TRANS_EVENT.CARRIER_REJECT, label: '提案を不承諾する' },
                  { event: eventAccept, action: TRANS_EVENT.CARRIER_APPROVE, label: '提案を承諾する' },
                ].map(({ event, action, label }) => (
                  <div key={action} className='flex justify-end'>
                    <Button
                      className='text-base font-bold min-w-[8.5rem] h-12 lg:px-8 md:px-4 py-4 '
                      color={event === eventAccept ? 'primary' : 'danger'}
                      variant={event === eventAccept ? 'solid' : 'bordered'}
                      radius='sm'
                      onPress={() => event && event(action)}
                    >
                      {label}
                    </Button>
                  </div>
                ))}
              </>
            )}

            {isCarrierRequest && (
              <div className='flex justify-end'>
                <Button
                  className='text-base font-bold min-w-[8.5rem] h-12 lg:px-8 md:px-4 py-4'
                  color='danger'
                  variant='bordered'
                  radius='sm'
                  onPress={() => eventDeny && eventDeny(TRANS_EVENT.CARRIER_CANCEL)}
                >
                  予約を取り消す
                </Button>
              </div>
            )}

            {isCarrierReProposal && (
              <div className='flex justify-end'>
                <Button
                  className='text-base font-bold min-w-[8.5rem] h-12 lg:px-8 md:px-4 py-4'
                  color='primary'
                  radius='sm'
                  onPress={() => eventAccept && eventAccept(TRANS_EVENT.CARRIER_RE_PROPOSAL)}
                >
                  再提案
                </Button>
              </div>
            )}
            {isShipperReProposal && (
              <div className='flex justify-end'>
                <Button
                  className='text-base font-bold min-w-[8.5rem] h-12 lg:px-8 md:px-4 py-4'
                  color='primary'
                  radius='sm'
                  onPress={() => eventAccept && eventAccept(TRANS_EVENT.RE_PROPOSAL)}
                >
                  再提案
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoBlock;
