import { Button, Card, CardBody } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import CmnTextarea from '@/components/common/CmnTextarea';
import CmnTimeInput, { TimeString } from '@/components/common/CmnTimeInput';
import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TransType } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { OUT_PACKAGES } from '@/constants/shipper';
import useModals from '@/hook/useModals';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { convertDateFormatPickerYYYYMMDD, formatCurrency, formatTime, formatTimeHHMM } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { transactionService } from '@/services/transaction/transaction';
import { ENotificationType } from '@/types/app';
import { CarInfo, PackageCNSLine, ProposeTrspAbility } from '@/types/carrier/transport';
import { CutOffInfoType } from '@/types/shipper/transaction';

import MarketPriceModal from './MarketPriceModal';

interface ConditionProposalModalProps {
  id: string;
  isOpen: boolean;
  item: ProposeTrspAbility;
  car: CarInfo;
  parent: PackageCNSLine;
  cutOffInfos: CutOffInfoType[];
  onClose?: () => void;
  onOpenCompanyDetail?: (id: string, role: string) => void;
  onOpenSuccessModal?: () => void;
}

interface ReactHookForm {
  price: number;
  cutoffFare1: { type: string; price: number | null };
  deliveryTime?: { TimeStart: TimeString; TimeEnd: TimeString };
  comment?: string;
}

function ConditionProposalPackageModal(props: ConditionProposalModalProps) {
  const {
    id,
    parent,
    item,
    car,
    cutOffInfos,
    isOpen = false,
    onClose = () => null,
    onOpenCompanyDetail = () => null,
    onOpenSuccessModal = () => null,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const regions = useAppSelector((state: RootState) => state.app.locations);

  const transactionApi = transactionService();
  const dispatch = useAppDispatch();

  const {
    handleSubmit,
    watch,
    register,
    trigger,
    setError,
    clearErrors,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ReactHookForm>({
    defaultValues: {
      price: car?.freight_rate ? Number(car?.freight_rate) : undefined,
      cutoffFare1: { type: cutOffInfos[0].cutOffTime.toString(), price: cutOffInfos[0].cutOffFee },
      deliveryTime: {
        TimeStart: car?.service_strt_time
          ? (formatTimeHHMM(car?.service_strt_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
          : '5:00',
        TimeEnd: car?.service_end_time
          ? (formatTimeHHMM(car?.service_end_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
          : '12:00',
      },
      comment: '',
    },
  });

  const { modals, openModal, closeModal } = useModals({
    modalResult: false,
    modalMarketPrice: false,
    // TODO multiple modals
  });

  const itemDropdowns =
    (cutOffInfos &&
      cutOffInfos.map((item) => ({
        key: item.id.toString(),
        label: `${item.cutOffTime} 時間前 ${item.cutOffFee}円`,
      }))) ||
    [];

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleSelectCutOffInfos = (value: number) => {
    const cutOff = cutOffInfos?.find((c) => c.id === value);
    if (!cutOff) return;
    setValue('cutoffFare1.type', cutOff.cutOffTime.toString());
    setValue('cutoffFare1.price', cutOff.cutOffFee);
  };

  const handleTimeChange = (data: any) => {
    const dataTime = {
      timeStart: data.timeStart ? data.timeStart : null,
      timeEnd: data.timeEnd ? data.timeEnd : null,
    };
    setValue('deliveryTime.TimeStart', dataTime.timeStart);
    setValue('deliveryTime.TimeEnd', dataTime.timeEnd);

    clearErrors('deliveryTime');
    trigger('deliveryTime');
  };

  const submitCarrierFE = async () => {
    let negotiation: object;
    negotiation = {
      departure_time: formatTimeHHMM(watch('deliveryTime.TimeStart'), TIME_FORMAT.HH_MM),
      arrival_time: formatTimeHHMM(watch('deliveryTime.TimeEnd'), TIME_FORMAT.HH_MM),
      cut_off_fee: watch('cutoffFare1.price') || 0,
      cut_off_time: Number(watch('cutoffFare1.type')) || null,
      price: ((watch('price') ?? 0) - (watch('cutoffFare1.price') ?? 0))?.toString().replace(/[^0-9]/g, ''),
      comment: watch('comment'),
    };

    const payload = {
      cns_line_item_id: parent.cns_line_item_id || 1,
      cns_line_item_by_date_id: parent.id,
      req_cns_line_item_id: parent.req_cns_line_item_id,
      vehicle_avb_resource_id: item?.vehicle_avb_resource_id,
      vehicle_avb_resource_item_id: item.id,
      trans_type: parent.trans_type,
      negotiation,
    };
    const response = await transactionApi
      .apiAth0212(payload)
      .then((response) => {
        if (response.data.id) {
          onOpenSuccessModal();
          onClose();
        } else {
          console.error('Error:', response);
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.ERROR,
              title: gTxt('MESSAGES.FAILED'),
              content: gTxt('MESSAGES.FAILED'),
            }),
          );
        }
      })
      .catch((error) => {
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
    return response;
  };

  const submitCarrierFEIX = async () => {
    let negotiation: object;
    negotiation = {
      departure_time: formatTimeHHMM(watch('deliveryTime.TimeStart'), TIME_FORMAT.HH_MM),
      arrival_time: formatTimeHHMM(watch('deliveryTime.TimeEnd'), TIME_FORMAT.HH_MM),
      cut_off_fee: watch('cutoffFare1.price') || 0,
      cut_off_time: Number(watch('cutoffFare1.type')) || null,
      price: ((watch('price') ?? 0) - (watch('cutoffFare1.price') ?? 0))?.toString().replace(/[^0-9]/g, ''),
      comment: watch('comment'),
    };

    const payload = {
      cns_line_item_by_date_id: parent.id,
      vehicle_avb_resource_item_id: item?.id,
      service_no: car.service_no || null,
      departure_date: car?.service_strt_date
        ? convertDateFormatPickerYYYYMMDD(car?.service_strt_date, DATE_FORMAT.YYYY_MM_DD)
        : null,
      departure_time: car?.service_strt_time
        ? (formatTimeHHMM(car?.service_strt_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
        : null,
      arrival_time: car?.service_end_time
        ? (formatTimeHHMM(car?.service_end_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
        : null,
      collection_time_to: parent.collection_time_to
        ? (formatTimeHHMM(parent?.collection_time_to, TIME_FORMAT.HH_MM) as `${number}:${number}`)
        : null,
      price: ((watch('price') ?? 0) - (watch('cutoffFare1.price') ?? 0))?.toString().replace(/[^0-9]/g, ''),
      arrival_date: car?.service_strt_date
        ? convertDateFormatPickerYYYYMMDD(car?.service_strt_date, DATE_FORMAT.YYYY_MM_DD)
        : null,
      // trsp_op_trailer_id: item.trsp_op_trailer_id,
      giai: item.giai,
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
      negotiation,
    };

    const response = await transactionApi
      .apiAth3061(payload)
      .then((response) => {
        if (response && response.propose_id) {
          onOpenSuccessModal();
          onClose();
        } else {
          console.error('Error:', response);
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.ERROR,
              title: gTxt('MESSAGES.FAILED'),
              content: gTxt('MESSAGES.FAILED'),
            }),
          );
        }
      })
      .catch((error) => {
        dispatch(
          actions.appAction.showNotification({
            type: ENotificationType.ERROR,
            title: gTxt('MESSAGES.FAILED'),
            content: gTxt('MESSAGES.FAILED'),
          }),
        );
      })
      .finally(() => {
        setIsLoading(false);
      });

    return response;
  };

  const onSubmit = async (data: ReactHookForm) => {
    if (parent.trans_type == TransType.CARRIER) {
      await submitCarrierFEIX();
    } else {
      await submitCarrierFE();
    }
  };

  return (
    <>
      <CmnModal id={id} isOpen={isOpen} placement='top' size='5xl' onClose={onClose} radius='none'>
        <CmnModalHeader
          title='条件を調整して提案する'
          description='輸送計画に類似する運送能力内容を調整して提案を行います。'
          className='flex flex-col font-normal'
        />
        <CmnModalBody classNames=''>
          <Card className='w-full rounded-lg border border-other-gray shadow-none'>
            {parent && parent.trans_type === TransType.SHIPPER ? (
              <CardBody className='w-full rounded-lg border border-other-gray'>
                <div className='justify-start items-center gap-4 inline-flex my-4 flex-wrap'>
                  <div className='px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex'>
                    <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                      <div className='text-base font-bold leading-7'>運送区間</div>
                      <div className='text-2xl font-medium leading-9'>{`${parent?.departure_from ? getPrefectureName(regions, parent?.departure_from) : ''}`}</div>
                      <Icon icon='keyboard_arrow_right' size={24} />
                      <div className='text-2xl font-medium leading-9'>{`${parent?.arrival_to ? getPrefectureName(regions, parent?.arrival_to) : ''}`}</div>
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-base font-bold leading-7'>希望持ち込み時間</div>
                    <div className='text-2xl font-medium leading-9'>{`${parent?.collection_time_from ? formatTime(parent?.collection_time_from, TIME_FORMAT.HH_MM_SS) : ''}-${parent?.collection_time_to ? formatTime(parent?.collection_time_to, TIME_FORMAT.HH_MM_SS) : ''}`}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-base font-bold leading-7'>希望運賃</div>
                    <div className='text-2xl font-medium leading-9'>
                      ¥ {parent?.price_per_unit ? formatCurrency(`${parent?.price_per_unit}`) : ''}
                    </div>
                  </div>
                </div>
                <div className='flex items-start gap-[15px] flex-wrap'>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>荷主</div>
                    <div className='text-2xl font-medium leading-9'>{parent?.operator_name}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>品名</div>
                    <div className='text-2xl font-medium leading-9'>{parent?.transport_name}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>品目</div>
                    <div className='text-2xl font-medium leading-9'>
                      {parent?.outer_package_code
                        ? OUT_PACKAGES.find((op) => op.key === parent?.outer_package_code?.toString())?.label
                        : ''}
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>温度帯</div>
                    <div className='text-2xl font-medium leading-9'>
                      {parent?.temperature_range ? getCondition(parent?.temperature_range) : ''}
                    </div>
                  </div>
                  <Button
                    color='primary'
                    className='w-48 rounded-lg text-base font-bold h-12 ml-auto'
                    onPress={() => onOpenCompanyDetail(parent?.operator_id, 'shipper')}
                  >
                    荷主会社情報を見る
                  </Button>
                </div>
              </CardBody>
            ) : (
              <CardBody className='w-full rounded-lg border border-other-gray'>
                <div className='justify-start items-center gap-4 inline-flex my-4 flex-wrap'>
                  <div className='px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex'>
                    <div className='justify-start items-center gap-2 flex'>
                      <div className='text-base font-bold leading-7'>運送区間</div>
                      <div className='text-2xl font-medium leading-9'>{`${item?.departure_from ? getPrefectureName(regions, item?.departure_from) : ''}`}</div>
                      <Icon icon='keyboard_arrow_right' size={24} />
                      <div className='text-2xl font-medium leading-9'>{`${item?.arrival_to ? getPrefectureName(regions, item?.arrival_to) : ''}`}</div>
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>希望持ち込み時間</div>
                    <div className='text-2xl font-medium leading-9'>{`${parent?.request_snapshot?.collection_time_from ? formatTime(parent?.request_snapshot?.collection_time_from, TIME_FORMAT.HH_MM_SS) : ''}-${parent?.request_snapshot?.collection_time_to ? formatTime(parent?.request_snapshot?.collection_time_to, TIME_FORMAT.HH_MM_SS) : ''}`}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>希望運賃</div>
                    <div className='text-2xl font-medium leading-9'>
                      ¥{' '}
                      {parent?.request_snapshot?.price_per_unit
                        ? formatCurrency(`${parent?.request_snapshot?.price_per_unit}`)
                        : ''}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-[15px] flex-wrap'>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>荷主</div>
                    <div className='text-2xl font-medium leading-9'>{parent?.request_snapshot?.operator_name}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>品名</div>
                    <div className='text-2xl font-medium leading-9'>{parent?.request_snapshot?.transport_name}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>品目</div>
                    <div className='text-2xl font-medium leading-9'>
                      {parent?.request_snapshot?.outer_package_code
                        ? OUT_PACKAGES.find((op) => op.key === parent?.request_snapshot?.outer_package_code?.toString())
                            ?.label
                        : ''}
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex'>
                    <div className='text-base font-bold leading-7'>温度帯</div>
                    <div className='text-2xl font-medium leading-9'>
                      {parent?.request_snapshot?.temperature_range
                        ? getCondition(parent?.request_snapshot?.temperature_range)
                        : ''}
                    </div>
                  </div>
                  <Button
                    color='primary'
                    className='w-48 rounded-lg text-base font-bold h-12 ml-auto'
                    onPress={() =>
                      parent?.request_snapshot?.operator_id &&
                      onOpenCompanyDetail(parent.request_snapshot.operator_id, 'shipper')
                    }
                  >
                    荷主会社情報を見る
                  </Button>
                </div>
              </CardBody>
            )}
          </Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className='w-full rounded-lg border border-other-gray shadow-none'>
              <CardBody className='w-full rounded-lg border border-other-gray text-foreground text-base font-bold leading-9 p-8'>
                <p className=''>運送能力を調整する</p>
                <div className='w-full space-y-2'>
                  <div className='flex items-center'>
                    <p className='w-36'>便名</p>
                    <p className='font-normal'>{item?.trip_name}</p>
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>区間</p>
                    <p className='font-normal'>
                      {`出発地 ${getPrefectureName(regions, item?.departure_from)} ～ 経由地なし ～ 到着地 ${getPrefectureName(regions, item?.arrival_to)}`}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>運行日時</p>
                    <p className='font-normal'>
                      {car?.service_strt_date && dayjs(car?.service_strt_date).format(DATE_FORMAT.JAPANESE)}
                    </p>
                  </div>
                  <div className='flex items-start'>
                    <p className='w-36'>運行車両</p>
                    <p className='font-normal'>
                      {car?.tractor_idcr == 1 ? car?.car_license_plt_num_id : car?.trailer_license_plt_num_id}{' '}
                      {car?.vehicle_name ?? ''} {car?.temperature_range ? getCondition(car?.temperature_range) : ''}
                    </p>
                  </div>
                  <div className='flex items-center mt-4'>
                    <p className='w-36'>共通運賃入力</p>
                    <CmnInputNumber
                      size='md'
                      title=''
                      isCurrency={true}
                      classNameWrap='w-[9.5rem]'
                      valueDefault={car?.freight_rate ? Number(car?.freight_rate) : undefined}
                      setValue={setValue}
                      register={register}
                      name='price'
                      rules={{
                        required: '共通運賃入力は必須です',
                      }}
                      errorMessage={errors?.price?.message}
                    />
                  </div>
                  <div className='flex items-center py-4'>
                    <p className='w-36'>持込時間 </p>
                    <CmnTimeInput
                      classNameWrap='min-w-[200px]'
                      size='md'
                      onChangeTime={handleTimeChange}
                      onError={(message: string) => {
                        if (message) {
                          setError('deliveryTime.TimeStart', { message });
                        } else {
                          clearErrors('deliveryTime.TimeStart');
                          clearErrors('deliveryTime.TimeEnd');
                          trigger(['deliveryTime.TimeStart', 'deliveryTime.TimeEnd']);
                        }
                      }}
                      defaultTimeStart={
                        car?.service_strt_time
                          ? (formatTime(car?.service_strt_time, TIME_FORMAT.HH_MM_SS) as `${number}:${number}`)
                          : '00:00'
                      }
                      defaultTimeEnd={
                        car?.service_end_time
                          ? (formatTime(car?.service_end_time, TIME_FORMAT.HH_MM_SS) as `${number}:${number}`)
                          : '00:00'
                      }
                      required={true}
                      errorMessage={errors.deliveryTime?.TimeStart?.message || errors.deliveryTime?.TimeEnd?.message}
                    />
                  </div>
                  <div className='flex items-start mb-4'>
                    <p className='w-36'>カットオフ運賃</p>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-4'>
                        <CmnDropdown
                          classNameWrap='!min-w-[9.8375rem] w-[9.8375rem]'
                          size='sm'
                          classNameSelect='!h-[35px]'
                          defaultSelectedKeys={[
                            itemDropdowns && itemDropdowns.length > 0 ? itemDropdowns[0].key.toString() : '',
                          ]}
                          onChange={(e) => handleSelectCutOffInfos(Number(e.target.value))}
                          placeholder='選択'
                          items={itemDropdowns}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='w-full pt-4'>メッセージ入力</div>
                  <div className='flex flex-col items-start mt-3'>
                    <p className='w-full text-xs text-other-gray'>※運行するメッセージを入力してください。</p>
                    <CmnTextarea
                      title=''
                      classNameWrap='w-[30.5rem] mt-2'
                      register={register}
                      name='comment'
                      defaultValue={watch('comment')}
                      rules={{
                        maxLength: {
                          value: 1000,
                          message: 'メッセージは1000文字以内で入力してください',
                        },
                      }}
                      errorMessage={errors?.comment?.message}
                    />
                  </div>
                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      color='primary'
                      className='w-40 rounded-lg text-base font-bold h-12'
                      onPress={() => openModal('modalMarketPrice')}
                    >
                      市場価格を見る
                    </Button>
                  </div>
                  <div className='flex justify-end mt-4'>
                    <Button
                      type='submit'
                      color='primary'
                      className='w-48 rounded-lg text-base font-bold h-12'
                      isDisabled={!isValid}
                    >
                      この内容で提案する
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </form>
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            color: 'primary',
            variant: 'light',
            onPress: onClose,
            className: 'bg-[#e8f1fe] text-base font-bold text-primary border-none mt-6',
          }}
        />
      </CmnModal>

      <MarketPriceModal isOpen={modals.modalMarketPrice} onClose={() => closeModal('modalMarketPrice')} />
    </>
  );
}

export default ConditionProposalPackageModal;
