'use client';

import { Spinner } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';

import { VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getPrefectureName } from '@/lib/prefectures';
import { RootState } from '@/redux/store';
import { negotiationCarrierService } from '@/services/carrier/negotiation';
import { VehicleDiagramData } from '@/types/carrier/negotiation';

interface MobilityHubBlockProps {
  vehicleDiagramItemId: number;
}

const MobilityHubBlock: FC<MobilityHubBlockProps> = (props) => {
  const { vehicleDiagramItemId } = props;

  const [loading, setLoading] = useState(false);
  const [deliveryTrackingData, setDeliveryTrackingData] = useState<VehicleDiagramData>();

  const fetchDeliveryTrackingData = async () => {
    if (!vehicleDiagramItemId) return;
    try {
      setLoading(true);
      const vehicleCarrierApi = negotiationCarrierService();
      const response = await vehicleCarrierApi.detailDeliveryAbilityTracking(vehicleDiagramItemId);
      setDeliveryTrackingData(response as unknown as VehicleDiagramData);
    } catch (error) {
      console.error('Error transaction shipper:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveryTrackingData();
  }, [vehicleDiagramItemId]);

  const regions = useAppSelector((state: RootState) => state.app.locations);

  const getMobitiHubStartTime = () => {
    if (deliveryTrackingData?.departure_time) {
      // mobiti hub = departure_time - 10 minutes
      const mobitiHubStartTime = dayjs(deliveryTrackingData?.departure_time, 'HH:mm')
        .subtract(10, 'minutes')
        .format('HH:mm');
      const mobitiHubEndTime = dayjs(deliveryTrackingData?.departure_time, 'HH:mm').add(10, 'minutes').format('HH:mm');
      return `${mobitiHubStartTime}-${mobitiHubEndTime}`;
    }
    return '';
  };

  const getMobitiHubEndTime = () => {
    if (deliveryTrackingData?.arrival_time) {
      const mobitiHubStartTime = dayjs(deliveryTrackingData?.arrival_time, 'HH:mm')
        .subtract(10, 'minutes')
        .format('HH:mm');
      const mobitiHubEndTime = dayjs(deliveryTrackingData?.arrival_time, 'HH:mm').add(10, 'minutes').format('HH:mm');
      return `${mobitiHubStartTime}-${mobitiHubEndTime}`;
    }
    return '';
  };

  const getTrailer = (deliveryTrackingData?.vehicle_diagram_allocations || []).filter(
    (item) => item?.vehicle_type === VEHICLE_TYPE.TRAILER,
  );

  return (
    <div className='flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg'>
      <div className='px-6 py-4'>
        <div className='text-[28px] h-6 leading-[1.875rem] font-normal mb-8'>モビリティハブ情報</div>
        {loading ? (
          <div className='flex justify-center py-10'>
            <Spinner color='primary' size='lg' />
          </div>
        ) : (
          <>
            <div className='flex flex-col space-y-2'>
              <div className='flex flex-wrap items-center font-bold text-base leading-7'>
                <div className='w-1/3'>
                  <span>
                    {deliveryTrackingData?.departure_from
                      ? getPrefectureName(regions, deliveryTrackingData?.departure_from)
                      : ''}
                  </span>
                </div>
                <div className='w-1/5 mr-2'>
                  <span className='whitespace-nowrap'>予約ステータス : 完了</span>
                </div>
                <div className='flex-1'>
                  {`予約日時 : ${deliveryTrackingData?.day ? dayjs(deliveryTrackingData?.day).locale('ja').format(DATE_FORMAT.JAPANESE) : ''}${getMobitiHubStartTime()}`}
                </div>
              </div>
              {(deliveryTrackingData?.vehicle_diagram_item_trailer || []).map((value, index) => (
                <div key={index} className='flex items-center text-base leading-7'>
                  <div className='w-1/3'>
                    <span>
                      {`${getTrailer[index]?.vehicle_info?.registration_area_code || ''} ${getTrailer[index]?.vehicle_info?.registration_group_number || ''} ${getTrailer[index]?.vehicle_info?.registration_character || ''} ${getTrailer[index]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[index]?.vehicle_info?.vehicle_name || ''}`}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <span>{index === 0 ? '予約スペース:21453354856' : '予約スペース:21453354856'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-4 flex flex-col space-y-2'>
              <div className='flex flex-wrap items-center font-bold text-base leading-7'>
                <div className='w-1/3'>
                  <span>
                    {deliveryTrackingData?.arrival_to
                      ? getPrefectureName(regions, deliveryTrackingData?.arrival_to)
                      : ''}
                  </span>
                </div>
                <div className='w-1/5 mr-2'>
                  <span className='whitespace-nowrap'>予約ステータス : 完了</span>
                </div>
                <div className='flex-1'>
                  {`予約日時 : ${deliveryTrackingData?.day ? dayjs(deliveryTrackingData?.day).locale('ja').format(DATE_FORMAT.JAPANESE) : ''}${getMobitiHubEndTime()}`}
                </div>
              </div>
              {(deliveryTrackingData?.vehicle_diagram_item_trailer || []).map((value, index) => (
                <div key={index} className='flex items-center text-base leading-7'>
                  <div className='w-1/3'>
                    <span>
                      {`${getTrailer[index]?.vehicle_info?.registration_area_code || ''} ${getTrailer[index]?.vehicle_info?.registration_group_number || ''} ${getTrailer[index]?.vehicle_info?.registration_character || ''} ${getTrailer[index]?.vehicle_info?.registration_number_1 || ''} ${getTrailer[index]?.vehicle_info?.vehicle_name || ''}`}
                    </span>
                  </div>
                  <div className='flex-1'>
                    <span>{index === 0 ? '予約スペース:21453354856' : '予約スペース:21453354856'}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default MobilityHubBlock;
