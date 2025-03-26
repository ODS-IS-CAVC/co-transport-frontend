'use client';

import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { INIT_SCHEDULE_VEHICLE_INFO_LIST } from '@/constants/carrier';
import { VEHICLE_TYPE } from '@/constants/common';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { VehicleDiagramAllocation } from '@/types/schedule';

import ScheduleChooseVehicleModal from './ScheduleChooseVehicleModal';

interface VehicleAllocationModalProps {
  isOpen: boolean;
  data: Partial<VehicleDiagramAllocation>[];
  onClose: () => void;
  onSubmit: (value: Partial<VehicleDiagramAllocation>[]) => void;
}

const VehicleAllocationModal = (props: VehicleAllocationModalProps) => {
  const { isOpen, data, onClose, onSubmit } = props;

  const [isShowScheduleChooseVehicleModal, setIsShowScheduleChooseVehicleModal] = useState(false);

  const [vehicleInfos, setVehicleInfos] = useState<Partial<VehicleDiagramAllocation>[]>(
    JSON.parse(JSON.stringify(INIT_SCHEDULE_VEHICLE_INFO_LIST)),
  );

  const [indexChooseVehicle, setIndexChooseVehicle] = useState<number>(0);

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(vehicleInfos)) {
      setVehicleInfos(JSON.parse(JSON.stringify(data)));
    }
  }, [data]);

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
    onSubmit(vehicleInfos);
  };

  return (
    <CmnModal size='4xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader title='車両割り当て修正' description='登録されている車両割り当てを修正します。' />
      <CmnModalBody className='text-xs'>
        <div className='p-4 rounded border border-other-gray'>
          <div className='font-bold'>おすすめ割り当て</div>
          <div className='mt-4 text-xs'>割り当て履歴から、よく使われる車両の込み合わせを自動で編成します</div>
          <div className='mt-4'>
            <div className='flex items-center gap-4'>
              <div className='flex flex-col items-start justify-end'>
                <div className='px-3 py-1 bg-other-gray rounded-lg text-white text-base font-bold'>
                  {gTxt('COMMON.VEHICLE_TYPE_TRACTOR')}
                </div>
                <div
                  className={cn(
                    'flex flex-col items-start w-[8.5rem]  px-2 py-[0.625rem] space-y-1 rounded-lg border border-[#BAC4CD] min-h-[5.25rem] mt-1',
                  )}
                >
                  <div className='text-xs truncate w-[7.5rem]'>沼津 100 あ 12-78</div>
                  <div className='text-sm font-bold'>日野 プロフィア</div>
                </div>
              </div>
              <div className='flex flex-col items-start justify-end'>
                <div className='px-3 py-1 bg-other-gray rounded-lg text-white text-base font-bold'>
                  {gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                </div>
                <div
                  className={cn(
                    'flex flex-col items-start w-[8.5rem]  px-2 py-[0.625rem] space-y-1 rounded-lg border border-[#BAC4CD] min-h-[5.25rem] mt-1',
                  )}
                >
                  <div className='text-xs truncate w-[7.5rem]'>沼津 100 あ 56-56</div>
                  <div className='text-sm font-bold'>トレクス トレーラ ドライ</div>
                </div>
              </div>
              <div className='flex flex-col items-start justify-end'>
                <div className='px-3 py-1 bg-other-gray rounded-lg text-white text-base font-bold'>
                  {gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                </div>
                <div
                  className={cn(
                    'flex flex-col items-start w-[8.5rem]  px-2 py-[0.625rem] space-y-1 rounded-lg border border-[#BAC4CD] min-h-[5.25rem] mt-1',
                  )}
                >
                  <div className='text-xs truncate w-[7.5rem]'>沼津 100 あ 56-78</div>
                  <div className='text-sm font-bold'>トレクス トレーラ ドライ</div>
                </div>
              </div>
            </div>
            <div className='flex items-center justify-end mt-4'>
              <Button size='lg' radius='sm' color='primary' onPress={() => {}}>
                入力確定
              </Button>
            </div>
          </div>
          <div className='mt-4'>
            <div className='font-bold'>手動割り当て</div>
            <div className='mt-4 text-xs'>車両を選択して割り当てを行います</div>
            <div className='mt-4 flex item-center space-x-4'>
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
                        'flex flex-col rounded-lg mt-1',
                        vehicle.vehicle_info?.id
                          ? 'min-h-[5.25rem] w-[8.5rem] px-2 py-[0.625rem] space-y-1 border border-[#BAC4CD] items-start'
                          : 'w-[10.25rem] bg-primary items-center justify-center h-12',
                      )}
                    >
                      {vehicle.vehicle_info?.id ? (
                        <>
                          <div className='text-xs truncate w-[7.5rem]'>{`${vehicle.vehicle_info.registration_area_code} ${vehicle.vehicle_info.registration_group_number} ${vehicle.vehicle_info.registration_character} ${vehicle.vehicle_info.registration_number_1}`}</div>
                          <div className='text-sm font-bold'>{vehicle.vehicle_info.vehicle_name}</div>
                        </>
                      ) : (
                        <>
                          <div className='text-white text-base font-bold'>
                            {gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className='flex items-center justify-end mt-4'>
              <Button
                size='lg'
                radius='sm'
                color='primary'
                isDisabled={
                  !vehicleInfos.some(
                    (vehicle) => vehicle.vehicle_type === VEHICLE_TYPE.TRACTOR && vehicle.vehicle_info?.id,
                  )
                }
                onPress={handleSubmit}
              >
                入力確定
              </Button>
            </div>
          </div>
        </div>
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
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '閉じる',
          className: 'font-bold text-base text-primary leading-normal bg-background border-none',
        }}
      />
    </CmnModal>
  );
};

export default VehicleAllocationModal;
