'use client';

import { Button, Spinner } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TEMPERATURE_RANGE, VEHICLE, VEHICLE_TYPE } from '@/constants/common';
import { KEY_COOKIE_TOKEN } from '@/constants/keyStorage';
import { useAppDispatch } from '@/hook/useRedux';
import { DAY_OF_WEEK_LIST_CHECKBOX } from '@/lib/dayOfWeek';
import { getCookie } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { vehicleCarrierService } from '@/services/carrier/vehicle';
import { ENotificationType } from '@/types/app';
import { VehicleData } from '@/types/carrier/vehicle';

import VehicleCostInfo from './VehicleCostInfo';
import VehicleDelete from './VehicleDelete';
import VehicleInfoUpdate from './VehicleInfoUpdate';
import VehicleOutOfService from './VehicleOutOfService';

const fetchDataVehicleDetail = async ({ id }: { id: number }) => {
  const userToken = getCookie(KEY_COOKIE_TOKEN);
  const vehicleCarrierApi = vehicleCarrierService(userToken as string);
  const result = await vehicleCarrierApi.vehicleDetail(id);
  return result;
};

const vehicleUpdate = async ({ id, data }: { id: number; data: VehicleData }) => {
  const vehicleCarrierApi = vehicleCarrierService();
  const result = await vehicleCarrierApi.vehicleUpdate(id, data);
  return result;
};

interface RegisterDetailProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
}

function RegisterDetail(props: RegisterDetailProps) {
  const { id, isOpen, onClose = () => null, fetchData = () => null } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);
  const [openVehicle, setOpenVehicle] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [openVehicleOut, setOpenVehicleOut] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData>();
  const [openCostInfo, setOpenCostInfo] = useState<{ status: boolean; page: number }>({ status: false, page: 0 });

  useEffect(() => {
    fetchDataVehicleDetail({ id })
      .then((response) => {
        setVehicleData(response);
      })
      .catch((error) => {
        console.log('[ERROR] = vehicleDetail:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUpdateOpenVehicle = (status: boolean) => {
    setOpenVehicle(status);
  };

  const handleUpdateOpenCostInfo = (status: boolean, page: number = 0) => {
    setOpenCostInfo({ status, page });
  };

  const handleClosePage = () => {
    if (openCostInfo.page === 1) {
      handleUpdateOpenVehicle(true);
    }
    handleUpdateOpenCostInfo(false);
  };

  const handleUpdateOpenVehicleOut = (status: boolean) => {
    setOpenVehicleOut(status);
  };

  const updateVehicleData = (data: VehicleData) => {
    router.refresh();
    setVehicleData((old) => ({ ...old, ...data }));
  };

  const handleUpdateStatusVehicle = () => {
    if (vehicleData) {
      setLoadingUpdate(true);
      const { id, images, ...vehicleInfo } = vehicleData.vehicle_info;
      const deleteFlag = vehicleData?.vehicle_info?.delete_flag === 0 ? 1 : 0;
      const dataCustomPut: any = {
        vehicle_info: { ...vehicleInfo, delete_flag: deleteFlag },
        vehicle_no_available: (vehicleData?.vehicle_no_available || []).map(({ id, vehicle_info_id, ...rest }) => rest),
      };
      const handleError = () => {
        dispatch(
          actions.appAction.showModalResult({
            type: ENotificationType.ERROR,
            title: gTxt('MENU.CARRIER.VEHICLE_PUT.TITLE_ERROR'),
            content: gTxt('MENU.CARRIER.VEHICLE_PUT.CONTENT_ERROR'),
          }),
        );
      };

      vehicleUpdate({
        id: vehicleData?.vehicle_info?.id,
        data: dataCustomPut,
      })
        .then((response) => {
          if (response && response?.status && response?.status !== 200) {
            handleError();
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.INFO,
                title: gTxt('MENU.CARRIER.VEHICLE_PUT.TITLE_SUCCESS'),
                content: gTxt('MENU.CARRIER.VEHICLE_PUT.CONTENT_SUCCESS'),
              }),
            );
            setVehicleData(
              (old) => ({ ...old, vehicle_info: { ...old?.vehicle_info, delete_flag: deleteFlag } }) as VehicleData,
            );
          }
        })
        .catch((error) => {
          handleError();
          console.log('[ERROR] = vehicleUpdate:', error);
        })
        .finally(() => {
          setLoadingUpdate(false);
        });
    }
  };

  const styleTitle = 'w-32 font-bold text-base text-black';

  const textDefault = '---';

  return (
    <>
      <CmnModal isOpen={isOpen} onClose={onClose}>
        <CmnModalHeader
          title={
            <>
              {loading ? (
                'Loading...'
              ) : (
                <div className='flex-1 flex items-center justify-between'>
                  <p className='text-black text-4xl font-normal leading-[3.15rem]'>車両情報詳細</p>
                  <Button
                    radius='sm'
                    onPress={() => setModalDelete(true)}
                    className='px-4 h-12 border-1 font-bold text-base border-error bg-white text-error'
                  >
                    車両情報削除
                  </Button>
                </div>
              )}
            </>
          }
          description='登録されている車両情報の詳細です。'
        />
        <CmnModalBody>
          {loading ? (
            <div className='flex items-center justify-center py-56'>
              <Spinner color='primary' size='lg' />
            </div>
          ) : (
            <div className='text-sm font-normal'>
              <div className='text-sm font-normal leading-[1.225rem] p-4 border border-other-gray rounded-lg'>
                <h3>車両情報</h3>
                <div className='flex items-start'>
                  <div className='mr-8'>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>車両ID</p>
                      <p className='leading-[1.531rem] text-foreground'>{vehicleData?.vehicle_info?.id}</p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>車両ナンバー</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        <span className='mr-2'>{vehicleData?.vehicle_info?.registration_area_code || ''}</span>
                        <span className='mr-2'>{vehicleData?.vehicle_info?.registration_group_number || ''}</span>
                        <span className='mr-2'>{vehicleData?.vehicle_info?.registration_character || ''}</span>
                        <span>{vehicleData?.vehicle_info?.registration_number_1 || ''}</span>
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>車両名称</p>
                      <p className='leading-[1.531rem] text-foreground'>{vehicleData?.vehicle_info?.vehicle_name}</p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>車両種別</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.vehicle_type === VEHICLE_TYPE.TRACTOR
                          ? VEHICLE[1].label
                          : vehicleData?.vehicle_info?.vehicle_type === VEHICLE_TYPE.TRAILER
                            ? VEHICLE[2].label
                            : textDefault}
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>温度帯</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.temperature_range?.length
                          ? vehicleData?.vehicle_info.temperature_range.map((item) => (
                              <span key={item} className='mr-4'>
                                {TEMPERATURE_RANGE[item as keyof typeof TEMPERATURE_RANGE]}
                              </span>
                            ))
                          : textDefault}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>最大積載量</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.max_payload || textDefault} t
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>荷台全長</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.total_length || textDefault} cm
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>荷台全幅</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.total_width || textDefault} cm
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>荷台全高</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.total_height || textDefault} cm
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>地上高</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.ground_clearance || textDefault} cm
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>門高</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.door_height || textDefault} cm
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>ボディ形状</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.body_shape || textDefault}
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
                      <p className={styleTitle}>ボディ仕様</p>
                      <p className='leading-[1.531rem] text-foreground'>
                        {vehicleData?.vehicle_info?.body_specification || textDefault}
                      </p>
                    </div>
                    <div className='leading-[1.225rem] flex items-center mt-4'>
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
                    onPress={() => handleUpdateOpenVehicle(true)}
                    className='px-4 text-base font-bold leading-6 h-12 mt-6'
                  >
                    車両情報の編集
                  </Button>
                </div>
              </div>

              <div className='mt-4 p-4 border border-other-gray rounded-lg'>
                <h3>原価計算用車両情報</h3>
                <div className='flex items-center justify-between'>
                  <p className='text-foreground leading-[1.225rem]'>原価計算用車両情報が設定されています</p>

                  <Button
                    radius='sm'
                    color='primary'
                    onPress={() => handleUpdateOpenCostInfo(true)}
                    className='px-4 text-base font-bold leading-6 h-12 mt-6'
                  >
                    詳細確認/修正
                  </Button>
                </div>
              </div>

              <div className='mt-4 p-4 border border-other-gray rounded-lg'>
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
                          <div key={`${data.id}_${index}`} className='flex items-center flex-wrap mt-2'>
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
                    onPress={() => handleUpdateOpenVehicleOut(true)}
                    className='px-4 text-base font-bold leading-6 h-12 mt-6'
                  >
                    詳細確認/修正
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            onPress: onClose,
            className: 'border-none bg-background rounded-lg font-bold px-4',
          }}
          buttonRightSecond={{
            isLoading: loadingUpdate,
            isDisabled: !vehicleData,
            onPress: handleUpdateStatusVehicle,
            className: 'border-none bg-primary text-white rounded-lg font-bold px-4',
            children: vehicleData?.vehicle_info?.delete_flag === 0 ? '車両情報非公開' : '車両情報公開',
          }}
        />
      </CmnModal>

      {openVehicle && (
        <VehicleInfoUpdate
          isOpen={openVehicle}
          fetchData={fetchData}
          data={vehicleData as VehicleData}
          onUpdateVehicleData={updateVehicleData}
          onClose={() => handleUpdateOpenVehicle(false)}
          onNextModal={() => handleUpdateOpenCostInfo(true, 1)}
        />
      )}
      {openCostInfo?.status && <VehicleCostInfo isOpen={openCostInfo?.status} onClose={handleClosePage} />}
      {openVehicleOut && (
        <VehicleOutOfService
          fetchData={fetchData}
          isOpen={openVehicleOut}
          onCloseFather={onClose}
          data={vehicleData as VehicleData}
          onUpdateVehicleData={updateVehicleData}
          onClose={() => handleUpdateOpenVehicleOut(false)}
        />
      )}
      {vehicleData?.vehicle_info?.id && (
        <VehicleDelete
          isOpen={modalDelete}
          fetchData={fetchData}
          onCloneFather={onClose}
          id={vehicleData?.vehicle_info?.id}
          onClose={() => setModalDelete(false)}
        />
      )}
    </>
  );
}

export default RegisterDetail;
