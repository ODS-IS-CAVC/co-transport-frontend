'use client';

import { Button, Spinner } from '@nextui-org/react';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';

import { OrderStatus } from '@/constants/transaction';
import { cn } from '@/lib/utils';
import { negotiationCarrierService } from '@/services/carrier/negotiation';
import { statusVehicleDiagram, VehicleDiagramData } from '@/types/carrier/negotiation';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

interface OperationStatusBlockProps {
  data: IDetailTransaction;
}

const OperationStatusBlock: FC<OperationStatusBlockProps> = ({ data }) => {
  const sipTrackId = data?.sip_track_id;
  const formatDay = (day: string | undefined) => {
    if (!day) return '--';
    return dayjs(day).format('YYYY年MM月DD日(ddd)');
  };

  const formatTime = (time: string | undefined) => {
    if (!time) return '00:00';
    return dayjs(time, 'HHmmss').format('HH:mm');
  };

  const [loading, setLoading] = useState(false);

  const [deliveryTrackingData, setDeliveryTrackingData] = useState<VehicleDiagramData>();

  const fetchDeliveryTrackingData = async () => {
    if (!data) return;
    try {
      setLoading(true);
      const vehicleCarrierApi = negotiationCarrierService();
      const response = await vehicleCarrierApi.detailDeliveryAbilityTracking(data.vehicle_diagram_item_id);
      setDeliveryTrackingData(response as unknown as VehicleDiagramData);
    } catch (error) {
      console.error('Error transaction shipper:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveryTrackingData();
  }, []);

  return (
    <div className='flex flex-col py-2 w-full h-full border border-gray-border rounded-lg my-3'>
      <div className='px-6 py-4'>
        <h3 className='font-normal mb-4'>運行状況</h3>
        {loading ? (
          <div className='flex justify-center py-10'>
            <Spinner color='primary' size='lg' />
          </div>
        ) : (
          <div>
            {[OrderStatus.START_TRANSPORT].includes(data.status) && <p className='text-sm'>運行前</p>}

            {/* {[OrderStatus.COMPLETE_TRANSPORT, OrderStatus.SHIPPER_PAYMENT].includes(data.status) && */}
            {(deliveryTrackingData?.vehicle_diagram_item_tracking?.slice().reverse() || []).map((item, index) => (
              <div key={index} className='mt-3 flex flex-row gap-6 items-start text-sm font-normal leading-6'>
                <div className='flex flex-col '>
                  <p className='text-nowrap'>{formatDay(item?.operation_date)}</p>
                  <p className='self-end'>{formatTime(item?.operation_time)}</p>
                </div>
                <div className='flex flex-col items-center justify-center gap-3'>
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-[#D9D9D9]',
                      item?.status === statusVehicleDiagram.FINISH && 'bg-primary',
                    )}
                  />

                  {index + 1 !== (deliveryTrackingData?.vehicle_diagram_item_tracking || []).length ? (
                    <div className='w-0.5 bg-[#D9D9D9] min-h-12' />
                  ) : (
                    <></>
                  )}
                </div>
                <div className='flex flex-col'>
                  {item?.label ? (
                    <p
                      className={cn(
                        'text-xs font-medium',
                        item?.status === statusVehicleDiagram.ERROR &&
                          'bg-[#FFC7C2] text-[#555555] w-[7.25rem] py-1 rounded-full text-center mb-1',
                      )}
                    >
                      {item?.label}
                    </p>
                  ) : (
                    <></>
                  )}

                  {item?.message ? (
                    <div
                      className='text-sm font-normal leading-6'
                      dangerouslySetInnerHTML={{ __html: item.message.replace(/<br\s*\/?>/, '') }}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))}
            {/* ))} */}
          </div>
        )}
        <div className='flex justify-end'>
          {[OrderStatus.COMPLETE_TRANSPORT, OrderStatus.SHIPPER_PAYMENT].includes(data.status) && (
            <Button
              radius='sm'
              onPress={() => window.open(`https://track-web-app.luffy-dev.ttmi-sg.com/tracks/${sipTrackId}`, '_blank')}
              className='text-base text-primary font-bold min-w-[8.5rem] h-14 px-8 py-4 text-white'
              color='primary'
            >
              現在走行位置確認
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default OperationStatusBlock;
