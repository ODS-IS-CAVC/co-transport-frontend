'use client';

import { Button, Skeleton } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useState } from 'react';

import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import { INIT_CARGO_INFO_SHIPPER } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { OUT_PACKAGES } from '@/constants/shipper';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatTime } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { cargoService } from '@/services/shipper/cargo';
import { transportService } from '@/services/shipper/transportPlan';
import { ENotificationType } from '@/types/app';
import { CargoInfoForm } from '@/types/shipper/cargo';
import { ITransportMatching } from '@/types/shipper/transport';
import { TransportInfo, TransportPlanInfoRequest } from '@/types/shipper/transportList';

import ModalDetailInfo from '../../../cargo-info/ModalDetailInfo';
import TransportFormModal from '../../../transport-info/TransportFormModal';
import RecordItemMatching from '../../RecordItemMatching';

interface ModalDetailMatchingProps {
  onClose: () => void;
  onSubmit: () => void;
  checkDetailMatching: (id: number) => void;
  dataItem?: ITransportMatching[];
  setIsLoadingDetail: (isLoading: boolean) => void;
}

const ModalDetailMatching = ({
  onClose,
  onSubmit,
  dataItem,
  checkDetailMatching,
  setIsLoadingDetail,
}: ModalDetailMatchingProps) => {
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const transportPlanApi = transportService();
  const cargoApi = cargoService();

  const dispatch = useAppDispatch();

  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false);
  const [detailTransportPlan, setDetailTransportPlan] = useState<TransportInfo>();

  const [showModalDetailInfo, setShowModalDetailInfo] = useState<boolean>(false);
  const [showModalRegisterPackage, setShowModalRegisterPackage] = useState<boolean>(false);
  const [dataDetail, setDataDetail] = useState<CargoInfoForm>({ ...INIT_CARGO_INFO_SHIPPER });

  const getDetailTransportPlan = async (id: number) => {
    return await transportPlanApi.transportPlanDetails(id);
  };

  const showDetailTransportPlan = async () => {
    if (dataItem![0].request_snapshot.trans_plan_id) {
      try {
        setIsLoadingDetail(true);
        const response = await getDetailTransportPlan(Number(dataItem![0].request_snapshot.trans_plan_id));
        setDetailTransportPlan({ ...response });
        setIsOpenModalDetail(true);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  const updateTransportPlan = (value: TransportPlanInfoRequest) => {
    if (value.transport_plan.id) {
      setIsLoadingDetail(true);
      transportPlanApi
        .updateTransportPlan(value.transport_plan.id, value)
        .then(() => {
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.SUCCESS,
              title: '輸送計画の編集',
              content: gTxt('MESSAGES.SUCCESS'),
            }),
          );
        })
        .finally(() => {
          setIsLoadingDetail(false);
        });
    }
    setDetailTransportPlan(undefined);
    setIsOpenModalDetail(false);
  };

  const handleDelete = (id: number) => {
    const showErrorDelete = () => {
      dispatch(
        actions.appAction.showNotification({
          type: ENotificationType.ERROR,
          title: '荷物情報を削除する',
          content: gTxt('MESSAGES.FAILED'),
        }),
      );
    };

    setIsLoadingDetail(true);
    cargoApi
      .deleteCargo(id)
      .then((response) => {
        if (response && response?.status && response?.status !== 200) {
          showErrorDelete();
        } else {
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.SUCCESS,
              title: '荷物情報を削除する',
              content: gTxt('MESSAGES.SUCCESS'),
            }),
          );
        }
      })
      .catch(() => showErrorDelete())
      .finally(() => {
        setIsLoadingDetail(false);
      });
    onClose();
  };

  const handleOpenModalDetailCargo = async () => {
    setIsLoadingDetail(true);
    cargoApi
      .cargoDetail(Number(dataItem![0].request_snapshot.transport_code))
      .then((response) => {
        setDataDetail(response);
        setShowModalDetailInfo(true);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  };

  const handleCloseModalDetail = () => {
    setDataDetail({ ...INIT_CARGO_INFO_SHIPPER });
    setShowModalDetailInfo(false);
  };

  const handleCloseModalRegisterPackage = () => {
    setDataDetail({ ...INIT_CARGO_INFO_SHIPPER });
    setShowModalRegisterPackage(false);
  };

  const onSubmitForm = (formValue: CargoInfoForm, isRegister: boolean) => {
    if (isRegister) {
      const showErrorCreateCargo = () => {
        dispatch(
          actions.appAction.showModalResult({
            type: ENotificationType.ERROR,
            title: '荷物情報の個別登録',
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      };
      setIsLoadingDetail(true);
      cargoApi
        .createCargo(formValue)
        .then((response) => {
          if (response && response?.status && response?.status !== 200) {
            showErrorCreateCargo();
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.INFO,
                title: '荷物情報の登録が完了しました',
                onClose: () => {
                  handleCloseModalRegisterPackage();
                  onSubmit();
                },
              }),
            );
          }
        })
        .catch(() => showErrorCreateCargo())
        .finally(() => {
          setIsLoadingDetail(false);
        });
    } else {
      const showErrorUpdateCargo = (error?: any) => {
        if (
          error &&
          error?.payload?.responseData?.parameters?.error?.code == 'cns_line_item_by_date_have_in_trans_order'
        ) {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '輸送計画の編集',
              content: '輸送計画は取引中のため編集できません。',
            }),
          );
        } else {
          dispatch(
            actions.appAction.showModalResult({
              type: ENotificationType.ERROR,
              title: '荷物情報の個別登録',
              content: gTxt('MESSAGES.FAILED'),
            }),
          );
        }
      };
      setIsLoadingDetail(true);
      cargoApi
        .updateCargo(formValue)
        .then((response) => {
          if (response && response?.status && response?.status !== 200) {
            showErrorUpdateCargo();
          } else {
            dispatch(
              actions.appAction.showModalResult({
                type: ENotificationType.INFO,
                title: '荷物情報の編集が完了しました。',
                onClose: () => {
                  handleCloseModalDetail();
                  onSubmit();
                },
              }),
            );
          }
        })
        .catch((error) => showErrorUpdateCargo(error))
        .finally(() => {
          setIsLoadingDetail(false);
        });
    }
  };

  return (
    <>
      <CmnModalBody classNames='px-8 pt-8'>
        <h2 className='text-foreground text-[28px]'>案件詳細</h2>
        <div className='px-6 my-1 flex justify-between text-foreground text-base gap-2'>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>荷物ID</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].shipper_operator_code}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>品名</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].request_snapshot.transport_name}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>品目</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {
                    OUT_PACKAGES.find((op) => op.key === dataItem[0].request_snapshot.outer_package_code.toString())
                      ?.label
                  }
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>全長</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].request_snapshot.total_length}cm</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>全幅</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].request_snapshot.total_width}cm</span>
              )}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>全高</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].request_snapshot.total_height}cm</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>重量</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].request_snapshot.weight}t</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>温度帯</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {dataItem[0].request_snapshot.temperature_range &&
                    getCondition(dataItem[0].request_snapshot.temperature_range)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>備考</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].request_snapshot?.special_instructions}</span>
              )}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>輸送計画ID</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{dataItem[0].request_snapshot?.transport_code}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>運賃</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {currencyFormatWithIcon(dataItem[0].request_snapshot?.price_per_unit)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>出発地</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{getPrefectureName(regions, dataItem[0].departure_from)}</span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>経由地</span>
              <span className='font-normal'></span> {/* TODO */}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>到着地</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>{getPrefectureName(regions, dataItem[0].arrival_to)}</span>
              )}
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold whitespace-nowrap'>輸送日時</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {dataItem[0].request_snapshot?.collection_date &&
                    dayjs(dataItem[0].request_snapshot.collection_date).format(DATE_FORMAT.DEFAULT)}
                </span>
              )}
            </p>
            <p className='flex gap-2 flex-nowrap'>
              <span className='font-bold'>基本持込期限(カットオフ)</span>
              {!dataItem || !dataItem.length ? (
                <Skeleton as={'span'} className='w-32 h-6 mt-1' />
              ) : (
                <span className='font-normal'>
                  {dataItem[0].request_snapshot?.collection_time_from &&
                    formatTime(dataItem[0].request_snapshot?.collection_time_from, TIME_FORMAT.HHMM)}
                  {'~'}
                  {dataItem[0].request_snapshot?.collection_time_to &&
                    formatTime(dataItem[0].request_snapshot?.collection_time_to, TIME_FORMAT.HHMM)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className='flex gap-2 justify-end mt-4'>
          <Button
            className='text-neutral w-[12.375rem] font-bold h-12 text-base'
            size='sm'
            color='primary'
            radius='sm'
            onPress={handleOpenModalDetailCargo}
          >
            荷物情報の詳細を確認
          </Button>
          <Button
            className='text-neutral w-[12.375rem] font-bold h-12 text-base'
            size='sm'
            color='primary'
            radius='sm'
            onPress={showDetailTransportPlan}
          >
            輸送計画の詳細を確認
          </Button>
        </div>
        <h1 className='text-foreground'>マッチした運送能力</h1>
        <p className='text-[#757575] my-1 text-[12px]'>以下のマッチング中の一覧から輸送依頼先を選択してください</p>
        {dataItem &&
          dataItem.length > 0 &&
          dataItem.map((item, rowIndex) => (
            <RecordItemMatching key={rowIndex} dataItem={item} checkDetailMatching={checkDetailMatching} />
          ))}
        {isOpenModalDetail && (
          <TransportFormModal
            isOpen={isOpenModalDetail}
            modeEdit={true}
            detailData={detailTransportPlan}
            setLoadingDetail={setIsLoadingDetail}
            onClose={() => {
              setDetailTransportPlan(undefined);
              setIsOpenModalDetail(false);
            }}
            onSubmit={updateTransportPlan}
          />
        )}
        {/* modal show detail info */}
        {showModalDetailInfo && (
          <ModalDetailInfo
            dataDetail={dataDetail}
            onDelete={handleDelete}
            isOpen={showModalDetailInfo}
            setLoadingDetail={setIsLoadingDetail}
            onClose={handleCloseModalDetail}
            onSubmit={(formValue) => onSubmitForm(formValue, false)}
          />
        )}

        {/* modal register package */}
        {showModalRegisterPackage && (
          <ModalDetailInfo
            isRegister
            dataDetail={dataDetail}
            isOpen={showModalRegisterPackage}
            setLoadingDetail={setIsLoadingDetail}
            onClose={handleCloseModalRegisterPackage}
            onSubmit={(formValue) => onSubmitForm(formValue, true)}
          />
        )}
      </CmnModalBody>
      <CmnModalFooter
        classNames='px-8 pb-8'
        buttonLeftFirst={{
          children: '閉じる',
          className: 'border-none bg-background underline font-bold',
          onPress: onClose,
        }}
      />
    </>
  );
};

export default ModalDetailMatching;
