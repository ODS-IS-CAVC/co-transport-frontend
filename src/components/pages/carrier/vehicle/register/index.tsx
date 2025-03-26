'use client';

import { Button } from '@nextui-org/react';
import { useState } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TEMPERATURE_RANGE, VEHICLE, VEHICLE_TYPE } from '@/constants/common';
import { DAY_OF_WEEK_LIST_CHECKBOX } from '@/lib/dayOfWeek';
import { VehicleData } from '@/types/carrier/vehicle';

import VehicleCostInfoAdd from './VehicleCostInfoAdd';
import VehicleInfoAdd from './VehicleInfoAdd';
import VehicleOutOfService from './VehicleOutOfService';

interface RegisterProps {
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
}

function Register(props: RegisterProps) {
  const { isOpen = false, onClose = () => null, fetchData = () => null } = props;

  const [vehicleData, setVehicleData] = useState<VehicleData>();

  const [openPage, setOpenPage] = useState<{ pageActive: number; pagePrevious: number }>({
    pageActive: 0,
    pagePrevious: 0,
  });

  const handleUpdateOpenPage = (pageActive: number = 0, pagePrevious: number = 0) => {
    setOpenPage({ pageActive, pagePrevious });
  };

  const updateVehicleData = (data: VehicleData) => {
    setVehicleData((old) => ({ ...old, ...data }));
  };

  const styleTitle = 'w-32 font-bold text-base text-black';

  const textDefault = '---';

  return (
    <>
      <CmnModal isOpen={isOpen} onClose={onClose}>
        <CmnModalHeader title='運送能力・車両情報個別登録' description='車両情報を個別に登録することが可能です。' />
        <CmnModalBody>
          <div className='text-base leading-7 font-normal'>
            <div className='p-6 border border-other-gray rounded-lg'>
              <h3>車両情報</h3>

              <div className='flex items-start'>
                <div className='mr-8'>
                  <div className='flex items-center mt-4'>
                    <p className={styleTitle}>車両ID</p>
                    <p className='leading-[1.531rem] text-foreground'>{textDefault}</p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>車両ナンバー</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {!vehicleData?.vehicle_info ? (
                        textDefault
                      ) : (
                        <>
                          <span className='mr-2'>{vehicleData?.vehicle_info?.registration_area_code || ''}</span>
                          <span className='mr-2'>{vehicleData?.vehicle_info?.registration_group_number || ''}</span>
                          <span className='mr-2'>{vehicleData?.vehicle_info?.registration_character || ''}</span>
                          <span>{vehicleData?.vehicle_info?.registration_number_1 || ''}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>車両名称</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.vehicle_name || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>車両種別</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.vehicle_type === VEHICLE_TYPE.TRACTOR
                        ? VEHICLE[1].label
                        : vehicleData?.vehicle_info?.vehicle_type === VEHICLE_TYPE.TRAILER
                          ? VEHICLE[2].label
                          : textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>温度帯</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.temperature_range?.length
                        ? vehicleData.vehicle_info.temperature_range.map((item) => (
                            <span key={item} className='mr-4'>
                              {item === -1 ? '指定なし' : TEMPERATURE_RANGE[item as keyof typeof TEMPERATURE_RANGE]}
                            </span>
                          ))
                        : textDefault}
                    </p>
                  </div>
                </div>

                <div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>最大積載量</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.max_payload || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>荷台全長</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.total_length || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>荷台全幅</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.total_width || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>荷台全高</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.total_height || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>地上高</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.ground_clearance || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>門高</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.door_height || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>ボディ形状</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.body_shape || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>ボディ仕様</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.body_specification || textDefault}
                    </p>
                  </div>
                  <div className='text-primary leading-[1.225rem] flex items-center mt-4'>
                    <p className={styleTitle}>ボディ架装</p>
                    <p className='leading-[1.531rem] text-foreground'>
                      {vehicleData?.vehicle_info?.body_construction || textDefault}
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button
                  radius='sm'
                  color='primary'
                  onPress={() => handleUpdateOpenPage(1, 0)}
                  className='px-4 text-base font-bold leading-6 h-12 mt-6'
                >
                  車両情報の登録
                </Button>
              </div>
            </div>

            <div className='mt-4 p-6 border border-other-gray rounded-lg'>
              <h3>原価計算用車両情報</h3>
              <div className='flex items-center justify-between'>
                <p className='text-foreground leading-[1.225rem]'>原価計算用車両情報が設定されています</p>
                <Button
                  radius='sm'
                  color='primary'
                  isDisabled={!vehicleData}
                  onPress={() => handleUpdateOpenPage(2, 0)}
                  className='px-4 text-base font-bold leading-6 h-12'
                >
                  情報登録
                </Button>
              </div>
            </div>

            <div className='mt-4 p-6 border border-other-gray rounded-lg'>
              <h3>車両使用不可期間</h3>

              <div className='flex items-center justify-between mt-3'>
                <div>
                  <p className='text-foreground leading-[1.225rem]'>車両使用不可期間が設定されています</p>
                  <div className='text-foreground leading-[1.225rem]'>
                    {(vehicleData?.vehicle_no_available || []).map((data, index) => {
                      const formatDate = (dateString: string) => {
                        const year = dateString.substring(0, 4);
                        const month = dateString.substring(4, 6);
                        const day = dateString.substring(6, 8);
                        return `${year}年${month}月${day}日`;
                      };
                      const startDateFormatted = formatDate(data.start_date);
                      const endDateFormatted = formatDate(data.end_date);
                      return (
                        <div className='flex items-center flex-wrap mt-2'>
                          <p className='mr-2' key={`${data.id}_${data.start_date}_${data.end_date}_${index}`}>
                            {startDateFormatted}～{endDateFormatted}
                          </p>
                          {(data?.day_week || []).map((day, index, array) => (
                            <p key={day}>
                              {DAY_OF_WEEK_LIST_CHECKBOX.find((item) => item.value === String(day))?.label}
                              {index !== array.length - 1 ? '、' : ''}
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  radius='sm'
                  color='primary'
                  isDisabled={!vehicleData}
                  onPress={() => handleUpdateOpenPage(3, 0)}
                  className='px-4 text-base font-bold leading-6 h-12'
                >
                  情報登録
                </Button>
              </div>
            </div>
          </div>
        </CmnModalBody>

        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            onPress: onClose,
            className: 'border-none rounded-lg font-bold bg-background',
          }}
        />
      </CmnModal>

      {openPage?.pageActive === 1 && (
        <VehicleInfoAdd
          data={vehicleData as VehicleData}
          isOpen={openPage?.pageActive === 1}
          onUpdateVehicleData={updateVehicleData}
          onNextModal={() => handleUpdateOpenPage(2, 1)}
          onClose={() => {
            setVehicleData(undefined);
            handleUpdateOpenPage(0, 1);
          }}
        />
      )}
      {openPage?.pageActive === 2 && (
        <VehicleCostInfoAdd
          isOpen={openPage?.pageActive === 2}
          onClose={() => handleUpdateOpenPage(1, 2)}
          onNextModal={() => handleUpdateOpenPage(3, 2)}
        />
      )}
      {openPage?.pageActive === 3 && (
        <VehicleOutOfService
          fetchData={fetchData}
          onCloseModalFather={onClose}
          data={vehicleData as VehicleData}
          isOpen={openPage?.pageActive === 3}
          onUpdateVehicleData={updateVehicleData}
          onClose={() => handleUpdateOpenPage(2, 3)}
        />
      )}
    </>
  );
}

export default Register;
