'use client';

import { Button } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { INIT_SCHEDULE_VEHICLE_INFO_LIST } from '@/constants/carrier';
import { VEHICLE_TYPE } from '@/constants/common';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { useAppDispatch } from '@/hook/useRedux';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType } from '@/types/app';
import { DataFlightListItem, VehicleDiagramAllocation } from '@/types/schedule';

import ScheduleChooseVehicleModal from '../ScheduleChooseVehicleModal';

const updateDetailFlight = async ({ id, data }: { id: number; data: DataFlightListItem }) => {
  const userToken = getCookie(KEY_COOKIE_TOKEN);
  const scheduleCarrierApi = scheduleCarrierService(userToken as string);
  return await scheduleCarrierApi.updateDetailFlight(id, data);
};

interface VehicleAllocationProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  dataFlight: DataFlightListItem;
  onUpdateDataFlight: (data: DataFlightListItem) => void;
}

function VehicleAllocation(props: VehicleAllocationProps) {
  const { id, dataFlight, isOpen = false, onClose = () => null, onUpdateDataFlight = () => null } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [indexChooseVehicle, setIndexChooseVehicle] = useState<number>(0);
  const [isShowScheduleChooseVehicleModal, setIsShowScheduleChooseVehicleModal] = useState(false);
  const [vehicleInfos, setVehicleInfos] = useState<Partial<VehicleDiagramAllocation>[]>([
    ...INIT_SCHEDULE_VEHICLE_INFO_LIST,
  ]);

  useEffect(() => {
    if (dataFlight?.vehicle_diagram_allocations.length) {
      const allocations: Partial<VehicleDiagramAllocation>[] = [];

      const tractor = dataFlight.vehicle_diagram_allocations.find(
        (allocation) => allocation.id && allocation.vehicle_type === VEHICLE_TYPE.TRACTOR,
      );

      //get tractor
      if (tractor) {
        allocations.push({
          ...tractor,
          display_order: 1,
        });
      } else {
        allocations.push(INIT_SCHEDULE_VEHICLE_INFO_LIST[0]);
      }
      // //get trailer
      const lstTrailer = dataFlight.vehicle_diagram_allocations.filter(
        (allocation) => allocation.id && allocation.vehicle_type === VEHICLE_TYPE.TRAILER,
      );
      lstTrailer.forEach((trailer) => {
        allocations.push(trailer);
      });
      if (allocations.length < 3) {
        Array.from({ length: 3 - allocations.length }).forEach((_, index) => {
          allocations.push(INIT_SCHEDULE_VEHICLE_INFO_LIST[index + 1]);
        });
      }
      setVehicleInfos([...allocations]);
    }
  }, [dataFlight?.vehicle_diagram_allocations]);

  const openChooseVehicleModal = (index: number) => {
    setIndexChooseVehicle(index);
    setIsShowScheduleChooseVehicleModal(true);
  };

  const getDisabledVehicleTrailerId = () => {
    const selectedVehicle = vehicleInfos[indexChooseVehicle];
    if (selectedVehicle.vehicle_type === VEHICLE_TYPE.TRACTOR) {
      return undefined;
    }
    const trailerVehicle = vehicleInfos.find(
      (vehicle) =>
        vehicle.vehicle_type === VEHICLE_TYPE.TRAILER &&
        selectedVehicle.vehicle_info?.id !== vehicle.vehicle_info?.id &&
        vehicle.vehicle_info?.id,
    );
    return trailerVehicle?.vehicle_info?.id;
  };

  const handleSubmit = () => {
    // display_order
    let _vehicleInfos = vehicleInfos
      .map((vehicle, index) => {
        return {
          ...vehicle,
          display_order: index + 1,
        };
      })
      .filter((vehicle) => vehicle.vehicle_info?.id);

    const dataUpdate = {
      ...dataFlight,
      vehicle_diagram_allocations: _vehicleInfos,
    };

    setLoading(true);

    updateDetailFlight({
      id,
      data: dataUpdate as any,
    })
      .then((response) => {
        if (response?.status === ENotificationType.SUCCESS) {
          router.refresh();
          onUpdateDataFlight(dataUpdate as any);
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.INFO,
              title: '割り当て車両',
              content: response?.message || gTxt('MESSAGES.SUCCESS'),
            }),
          );
        } else {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '割り当て車両',
              content: response?.message || gTxt('MESSAGES.FAILED'),
            }),
          );
        }
      })
      .catch((error) => {
        dispatch(
          actions.appAction.showModalResult({
            type: ENotificationType.ERROR,
            title: '割り当て車両',
            content: error?.message || gTxt('MESSAGES.FAILED'),
          }),
        );
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <>
      <CmnModal isOpen={isOpen} onClose={onClose}>
        <CmnModalHeader title='車両割り当て修正' description='登録されている車両割り当てを修正します。' />
        <CmnModalBody>
          <div className='text-sm font-normal leading-[1.225rem] border rounded-lg border-other-gray p-6'>
            <p className='text-[#000000] font-bold text-base leading-7'>おすすめ割り当て</p>
            <p className='mt-2'>割り当て履歴から、よく使われる車両の込み合わせを自動で編成します</p>

            <div className='mt-4'>
              <div className='flex items-center'>
                <div className='mr-3'>
                  <div className='w-[6.438rem] h-8 bg-other-gray rounded-lg flex items-center justify-center'>
                    <p className='text-white text-base leading-6 font-bold'>{gTxt('COMMON.VEHICLE_TYPE_TRACTOR')}</p>
                  </div>
                  <div className='w-[7.563rem] h-[5.25rem] rounded-lg border border-gray-item p-2 mt-2'>
                    <p className='text-xs leading-[1.125rem] font-medium'>沼津 100 あ 12-78</p>
                    <p className='text-[#000000] text-sm font-bold leading-[1.313rem] mt-2'>日野 プロフィア</p>
                  </div>
                </div>

                <div className='mr-3'>
                  <div className='w-[6.438rem] h-8 bg-other-gray rounded-lg flex items-center justify-center'>
                    <p className='text-white text-base leading-6 font-bold'>{gTxt('COMMON.VEHICLE_TYPE_TRAILER')}</p>
                  </div>
                  <div className='w-[8.5rem] h-[5.25rem] rounded-lg border border-gray-item p-2 mt-2'>
                    <p className='text-xs leading-[1.125rem] font-medium'>沼津 100 あ 56-56</p>
                    <p className='text-[#000000] text-sm font-bold leading-[1.313rem] mt-2'>トレクス トレーラ</p>
                    <p className='text-[#000000] text-sm font-bold leading-[1.313rem]'>ドライ</p>
                  </div>
                </div>

                <div className='mr-3'>
                  <div className='w-[6.438rem] h-8 bg-other-gray rounded-lg flex items-center justify-center'>
                    <p className='text-white text-base leading-6 font-bold'>{gTxt('COMMON.VEHICLE_TYPE_TRAILER')}</p>
                  </div>
                  <div className='w-[8.5rem] h-[5.25rem] rounded-lg border border-gray-item p-2 mt-2'>
                    <p className='text-xs leading-[1.125rem] font-medium'>沼津 100 あ 56-78</p>
                    <p className='text-[#000000] text-sm font-bold leading-[1.313rem] mt-2'>トレクス トレーラ</p>
                    <p className='text-[#000000] text-sm font-bold leading-[1.313rem]'>ドライ</p>
                  </div>
                </div>
              </div>
              <div className='flex justify-end'>
                <Button radius='sm' type='submit' color='primary' className='h-12 px-4 font-bold text-base leading-6'>
                  入力確定
                </Button>
              </div>
            </div>

            <div className='mt-4'>
              <p className='text-[#000000] font-bold text-base leading-7'>手動割り当て</p>
              <p className='mt-2'>車両を選択して割り当てを行います</p>

              <div className='flex items-start space-x-3 mt-3'>
                {vehicleInfos.map((vehicle, index) => {
                  return (
                    <div
                      key={`vehicle-${index}`}
                      className='flex flex-col items-start justify-start cursor-pointer'
                      onClick={() => openChooseVehicleModal(index)}
                    >
                      <div className='px-3 py-1 bg-other-gray rounded-lg text-white text-base font-bold'>
                        {vehicle.vehicle_type === VEHICLE_TYPE.TRACTOR
                          ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                          : gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                      </div>
                      <div
                        className={cn(
                          'flex flex-col items-start min-w-[7.5rem] px-2 py-[0.625rem] space-y-1 rounded-lg border border-[#BAC4CD] mt-2',
                          vehicle.vehicle_info?.id ? 'min-h-[5.25rem]' : '',
                        )}
                      >
                        {vehicle.vehicle_info?.id ? (
                          <>
                            <div className='text-xs truncate'>{`${vehicle?.vehicle_info?.registration_area_code || ''} ${vehicle?.vehicle_info?.registration_group_number || ''} ${vehicle?.vehicle_info?.registration_character || ''} ${vehicle?.vehicle_info?.registration_number_1 || ''}`}</div>
                            <div className='text-sm font-bold'>{vehicle?.vehicle_info?.vehicle_name || ''}</div>
                          </>
                        ) : (
                          <>
                            <div>{gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}</div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className='flex justify-end'>
                <Button
                  radius='sm'
                  type='submit'
                  color='primary'
                  isLoading={loading}
                  onPress={handleSubmit}
                  className='h-12 px-4 font-bold text-base leading-6'
                >
                  入力確定
                </Button>
              </div>
            </div>
          </div>
        </CmnModalBody>

        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            onPress: onClose,
            className: 'text-base font-bold px-4 border-none bg-background',
          }}
        />
      </CmnModal>
      {isShowScheduleChooseVehicleModal && (
        <ScheduleChooseVehicleModal
          isOpen={isShowScheduleChooseVehicleModal}
          typeVehicle={vehicleInfos[indexChooseVehicle].vehicle_type || 0}
          vehicleSelectedId={vehicleInfos[indexChooseVehicle].vehicle_info?.id}
          disabledVehicleId={getDisabledVehicleTrailerId()}
          onClose={() => setIsShowScheduleChooseVehicleModal(false)}
          chooseVehicle={(vehicle) => {
            if (vehicle) {
              setVehicleInfos((prev) => {
                const newVehicleInfos = [...prev];
                newVehicleInfos[indexChooseVehicle].vehicle_info = vehicle?.vehicle_info;
                return newVehicleInfos;
              });
            } else {
              setVehicleInfos((prev) => {
                const newVehicleInfos = [...prev];
                newVehicleInfos[indexChooseVehicle].vehicle_info = undefined;
                return newVehicleInfos;
              });
            }
            setIsShowScheduleChooseVehicleModal(false);
          }}
        />
      )}
    </>
  );
}

export default VehicleAllocation;
