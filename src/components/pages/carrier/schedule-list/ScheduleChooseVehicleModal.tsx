'use client';
import { useEffect, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import { CmnPagination } from '@/components/common/CmnPagination';
import Label from '@/components/common/Label';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { DEFAULT_CURRENT_PAGE, TEMPERATURE_RANGE_LIST, VEHICLE_TYPE } from '@/constants/common';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { vehicleCarrierService } from '@/services/carrier/vehicle';
import { VehicleData } from '@/types/carrier/vehicle';

interface ScheduleChooseVehicleModalProps {
  isOpen: boolean;
  typeVehicle: number;
  vehicleSelectedId?: number;
  disabledVehicleId?: number;
  onClose: () => void;
  chooseVehicle: (vehicle?: VehicleData) => void;
}

const ScheduleChooseVehicleModal = (props: ScheduleChooseVehicleModalProps) => {
  const { isOpen, typeVehicle, vehicleSelectedId, disabledVehicleId, onClose, chooseVehicle } = props;

  const [selectedTemperature, setSelectedTemperature] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [vehicleList, setVehicleList] = useState<VehicleData[]>([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<number>();

  const fetchData = async (selectedTemperature = [], currentPage = DEFAULT_CURRENT_PAGE) => {
    const searchString = `temperature_range=${selectedTemperature.join(',')}&vehicle_type=${typeVehicle}&page=${currentPage}&pageSize=10`;
    const vehicleCarrierApi = vehicleCarrierService();
    const result = await vehicleCarrierApi.vehicle(searchString);
    setVehicleList(result?.dataList || []);
    setTotalPage(result?.totalPage || 0);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (vehicleSelectedId !== selectedVehicleId) {
      setSelectedVehicleId(vehicleSelectedId);
    }
  }, [vehicleSelectedId]);

  const updateSelectedVehicle = () => {
    const vehicle = vehicleList.find((item) => item.vehicle_info.id === selectedVehicleId);
    chooseVehicle(vehicle);
    setSelectedVehicleId(undefined);
  };

  const handleChangeCheckboxGroupVehicle = (value: string[]) => {
    let valueNew = [];
    if (value?.length > 0) {
      valueNew = [value[value.length - 1]];
    } else {
      valueNew = value;
    }
    setCurrentPage(DEFAULT_CURRENT_PAGE);
    setSelectedTemperature(valueNew);
    fetchData(valueNew as any, DEFAULT_CURRENT_PAGE);
  };

  return (
    <CmnModal isOpen={isOpen} hideCloseButton={true} onClose={onClose}>
      <CmnModalHeader
        title='手動割り当て'
        description='登録されている車両割り当てを修正します。車両を選択して割り当てを行います'
      />
      <CmnModalBody>
        <div className='flex items-center'>
          <Label title='温度帯指定' />
          <CmnCheckboxGroup
            size='sm'
            classNameWrap='mr-4'
            value={selectedTemperature || []}
            isDisabled={typeVehicle === VEHICLE_TYPE.TRACTOR}
            onChange={(value) => handleChangeCheckboxGroupVehicle(value)}
            option={TEMPERATURE_RANGE_LIST.map((item) => (item.label === 'すべて' ? { ...item, value: 'null' } : item))}
            classNames={{
              wrapper: 'px-4 py-2',
            }}
          />
        </div>
        <div className='mt-4'>
          <div className='mt-2 min-h-60'>
            {vehicleList.length > 0 ? (
              <>
                {vehicleList.map((item, index) => {
                  const id = item?.vehicle_info?.id;
                  return (
                    <div
                      key={`${id}-${index}`}
                      className={cn(
                        'mb-2 last:mb-0 p-2 border rounded-lg cursor-pointer border-other-gray',
                        disabledVehicleId === id && 'opacity-50 cursor-not-allowed',
                        selectedVehicleId === id && 'text-primary border-primary border-2',
                      )}
                      onClick={() => {
                        if (disabledVehicleId !== id) {
                          if (selectedVehicleId !== id) {
                            setSelectedVehicleId(id);
                          } else if (typeVehicle !== VEHICLE_TYPE.TRACTOR) {
                            setSelectedVehicleId(undefined);
                          }
                        }
                      }}
                    >
                      <div className='flex items-center justify-end whitespace-nowrap'>
                        <div className='font-bold'>車両ID</div>
                        <div className='ml-2'>{id}</div>
                      </div>
                      <div className='mt-1 flex flex-wrap items-center justify-between rounded-lg border border-[#D9D9D9] px-3 py-1'>
                        <div className='flex items-center whitespace-nowrap'>
                          <div className='font-bold'>機種</div>
                          <div className='ml-2 text-2xl font-medium'>{item?.vehicle_info?.vehicle_name}</div>
                        </div>
                        <div className='flex items-center whitespace-nowrap'>
                          <div className='font-bold'>タイプ</div>
                          <div className='ml-2 text-2xl font-medium'>
                            {item?.vehicle_info?.vehicle_type == VEHICLE_TYPE.TRACTOR
                              ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                              : gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                          </div>
                        </div>
                        <div className='flex items-center whitespace-nowrap'>
                          <div className='font-bold'>温度帯</div>
                          <div className='ml-2 text-2xl font-medium'>
                            {(item?.vehicle_info?.temperature_range || [])
                              .map((temperature) => TEMPERATURE_RANGE_LIST[temperature]?.label)
                              .join(', ')}
                          </div>
                        </div>
                        <div className='flex items-center whitespace-nowrap'>
                          <div className='font-bold'>車両ナンバー</div>
                          <div className='ml-2 text-2xl font-medium'>
                            {`${item?.vehicle_info?.registration_area_code || ''} ${item?.vehicle_info?.registration_group_number || ''} ${item?.vehicle_info?.registration_character || ''} ${item?.vehicle_info?.registration_number_1 || ''}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {totalPage > 0 && (
                  <div className='mt-4'>
                    <CmnPagination
                      totalPage={totalPage}
                      currentPage={currentPage}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        fetchData(selectedTemperature as any, page);
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className='bg-background px-4 py-40 text-center'>{gTxt('COMMON.NO_RECORD_FOUND')}</div>
            )}
          </div>
        </div>
      </CmnModalBody>
      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: '閉じる',
          className: 'text-base font-bold px-4 border-none bg-background',
        }}
        buttonRightSecond={{
          children: '車両を適用する',
          onPress: updateSelectedVehicle,
          className: 'text-base font-bold leading-6 px-4 bg-primary text-white',
        }}
      />
    </CmnModal>
  );
};

export default ScheduleChooseVehicleModal;
