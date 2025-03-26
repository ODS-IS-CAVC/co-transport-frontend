import { Button, Card, CardBody } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import CmnTextarea from '@/components/common/CmnTextarea';
import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { VEHICLE_TYPE } from '@/constants/common';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
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
import { CarInfo, ProposeTrspPlan, VehicleAVBResource } from '@/types/carrier/transport';
import { CutOffInfoType } from '@/types/shipper/transaction';

import MarketPriceModal from './MarketPriceModal';

interface ConditionProposalModalProps {
  id: string;
  isOpen: boolean;
  item: ProposeTrspPlan;
  car: CarInfo;
  parent: VehicleAVBResource;
  cutOffInfos: CutOffInfoType[];
  onClose?: () => void;
  onOpenCompanyDetail?: (id: string, role: string) => void;
  onOpenSuccessModal?: () => void;
}

interface ReactHookForm {
  price: number;
  cutoffFare: {
    type: string;
    price: number;
  };
  comment?: string;
}

function ConditionProposalVehicleModal(props: ConditionProposalModalProps) {
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
    reset,
    register,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isValid },
  } = useForm<ReactHookForm>({
    defaultValues: {
      price: parent?.price ? Number(parent?.price) : undefined,
      cutoffFare: {
        type: (cutOffInfos?.length > 0 && cutOffInfos[0].cutOffTime.toString()) || '',
        price: (cutOffInfos?.length > 0 && cutOffInfos[0].cutOffFee) || 0,
      },
    },
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
    setValue('cutoffFare.type', cutOff.cutOffTime.toString());
    setValue('cutoffFare.price', cutOff.cutOffFee);
  };

  const submitCarrierCarrierFEIX = async (data: ReactHookForm) => {
    let negotiation: object;
    negotiation = {
      departure_date: car?.service_strt_date
        ? convertDateFormatPickerYYYYMMDD(car?.service_strt_date, DATE_FORMAT.YYYY_MM_DD)
        : null,
      arrival_date: car?.service_strt_date
        ? convertDateFormatPickerYYYYMMDD(car?.service_strt_date, DATE_FORMAT.YYYY_MM_DD)
        : null,
      departure_time: car?.service_strt_time
        ? (formatTimeHHMM(car?.service_strt_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
        : null,
      arrival_time: car.service_end_time
        ? (formatTimeHHMM(car?.service_end_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
        : null,
      cut_off_fee: watch('cutoffFare.price') || 0,
      cut_off_time: Number(watch('cutoffFare.type')) || null,
      price: ((watch('price') ?? 0) - (watch('cutoffFare.price') ?? 0))?.toString().replace(/[^0-9]/g, ''),
      comment: watch('comment'),
    };
    const param = {
      cns_line_item_by_date_id: item?.id,
      vehicle_avb_resource_item_id: parent.id,
      service_no: car.service_no || null,
      departure_date: car?.service_strt_date
        ? convertDateFormatPickerYYYYMMDD(car?.service_strt_date, DATE_FORMAT.YYYY_MM_DD)
        : null,
      giai: parent?.giai || null,
      departure_time: car?.service_strt_time
        ? (formatTimeHHMM(car?.service_strt_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
        : null,
      arrival_date: car?.service_end_date
        ? convertDateFormatPickerYYYYMMDD(car.service_end_date, DATE_FORMAT.YYYY_MM_DD)
        : null,
      arrival_time: car?.service_end_time
        ? (formatTimeHHMM(car.service_end_time, TIME_FORMAT.HH_MM) as `${number}:${number}`)
        : null,
      price: ((watch('price') ?? 0) - (watch('cutoffFare.price') ?? 0))?.toString().replace(/[^0-9]/g, ''),
      isNotIX: process.env.NEXT_PUBLIC_IS_NOT_IX !== 'false' ? true : false,
      negotiation,
      // cid: companyId,
    };

    const response = await transactionApi
      .apiAth3061(param)
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
    await submitCarrierCarrierFEIX(data);
  };

  const { modals, openModal, closeModal } = useModals({
    modalMarketPrice: false,
  });

  return (
    <>
      <CmnModal id={id} isOpen={isOpen} placement='top' size='5xl' onClose={onClose} radius='none'>
        <CmnModalHeader
          title='条件を調整して予約する'
          description='輸送計画に類似する運送能力内容を調整して予約行います'
          className='flex flex-col font-normal'
        />
        <CmnModalBody classNames=''>
          <Card className='w-full rounded-lg border border-other-gray shadow-none'>
            <CardBody className='w-full rounded-lg border border-other-gray'>
              <div className='h-11 justify-between items-center inline-flex'>
                <div className='justify-start items-start gap-2 flex'>
                  <div className='px-2 py-1 bg-[#555555] rounded-lg justify-center items-center gap-2 flex'>
                    <div className='text-center text-[#f2f2f2] text-base font-bold leading-normal'>キャリア間</div>
                  </div>
                </div>
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-sm font-normal leading-tight'>運行日</div>
                  <div className='text-sm font-normal leading-tight'>
                    {dayjs(parent.day).format(DATE_FORMAT.JAPANESE)}
                  </div>
                </div>
              </div>
              <div className='justify-start items-center gap-4 flex mt-3 flex-wrap'>
                {/* <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                  <div className='text-base font-bold leading-7'>マッチ日</div>
                  <div className='text-2xl font-medium leading-9'>{dayjs().format(DATE_FORMAT.JAPANESE)}</div>
                </div> */}
                <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                  <div className='text-base font-bold leading-7'>便名</div>
                  <div className='text-2xl font-medium leading-9'>{parent.trip_name}</div>
                </div>
                <div className='h-9 px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex flex-nowrap'>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-base font-bold leading-7'>出発</div>
                    <div className='text-2xl font-medium leading-9'>{`${parent.departure_from ? getPrefectureName(regions, parent.departure_from) : ''} ${parent.service_strt_time ? `${dayjs(parent.service_strt_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)}発` : ''}`}</div>
                    <Icon icon='keyboard_arrow_right' size={24} />
                    <div className='text-base font-bold leading-7'>到着</div>
                    <div className='text-2xl font-medium leading-9'>{`${parent.arrival_to ? getPrefectureName(regions, parent.arrival_to) : ''} ${parent?.service_end_time ? `${dayjs(parent.service_end_time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HH_MM)}着` : ''}`}</div>
                  </div>
                </div>
                <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                  <div className='text-center text-base font-bold leading-7'>運賃</div>
                  <div className='text-center text-2xl font-medium leading-9'>
                    ¥ {parent?.price ? formatCurrency(`${parent.price + (parent.cut_off_fee || 0)} 円`) : ''}
                  </div>
                </div>
              </div>
              <div className='justify-start items-center gap-4 flex flex-wrap mt-3 whitespace-nowrap'>
                <div className='justify-start items-center gap-2 flex'>
                  <div className='text-base font-bold leading-7'>運送会社</div>
                  <div className='text-2xl font-medium leading-9'>{parent?.operator_name}</div>
                </div>
                <div className='px-3 py-1 rounded-lg border border-[#d9d9d9] justify-start items-center gap-6 flex flex-wrap'>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-base font-bold leading-7'>車両</div>
                    <div className='text-2xl font-medium leading-9'>{parent?.vehicle_name}</div>
                  </div>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-base font-bold leading-7'>タイプ</div>
                    <div className='text-2xl font-medium leading-9'>
                      {parent?.vehicle_type == VEHICLE_TYPE.TRACTOR
                        ? gTxt('COMMON.VEHICLE_TYPE_TRACTOR')
                        : gTxt('COMMON.VEHICLE_TYPE_TRAILER')}
                    </div>
                  </div>
                  <div className='justify-start items-center gap-2 flex whitespace-nowrap'>
                    <div className='text-base font-bold leading-7'>温度帯</div>
                    <div className='text-2xl font-medium leading-9'>
                      {parent?.temperature_range ? getCondition(parent?.temperature_range) : ''}
                    </div>
                  </div>
                  <div className='justify-start items-center gap-4 flex whitespace-nowrap'>
                    <div className='text-base font-bold leading-7'>車両ナンバー</div>
                    <div className='text-2xl font-medium leading-9'>{`${parent?.tractor_idcr == 1 ? parent?.car_license_plt_num_id : parent?.trailer_license_plt_num_id}`}</div>
                  </div>
                </div>
              </div>
              <div className='justify-end items-center gap-8 inline-flex mt-3'>
                <div className='justify-end items-end gap-2.5 inline-flex'>
                  <Button
                    color='primary'
                    onPress={() => onOpenCompanyDetail(parent.operator_id, 'carrier')}
                    className='w-48 rounded-lg text-base font-bold h-12'
                  >
                    運送会社情報を見る
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className='w-full rounded-lg border border-other-gray shadow-none'>
              <CardBody className='w-full rounded-lg border border-other-gray text-foreground text-base font-bold leading-9 p-8'>
                <p className='text-base font-bold leading-7'>条件を調整する</p>
                <div className='space-y-2 mt-2'>
                  <div className='flex items-center pt-4'>
                    <p className='w-36'>運賃入力</p>
                    <CmnInputNumber
                      size='md'
                      title=''
                      isCurrency={true}
                      classNameWrap='w-[9.5rem]'
                      valueDefault={parent?.price ? Number(parent?.price + (parent.cut_off_fee || 0)) : undefined}
                      setValue={setValue}
                      register={register}
                      name='price'
                      rules={{
                        required: '運賃入力は必須です',
                      }}
                      errorMessage={errors?.price?.message}
                    />
                  </div>
                  <div className='flex items-center py-2'>
                    <p className='w-44'>カットオフ時間選択</p>
                    <CmnDropdown
                      size='md'
                      classNameWrap='min-w-[4rem] w-44'
                      classNameSelect='min-h-9 h-9'
                      defaultSelectedKeys={[
                        (parent && parent.cut_off_info_id && parent.cut_off_info_id.toString()) || '選択',
                      ]}
                      onChange={(e) => {
                        handleSelectCutOffInfos(Number(e.target.value));
                      }}
                      placeholder='選択'
                      items={itemDropdowns}
                    />
                  </div>
                  <div className='flex items-center py-2'>キャリア間依頼する運行情報</div>
                  <div className='flex items-center'>
                    <p className='w-36'>便名</p>
                    <p className='font-normal leading-normal'>
                      {item.trsp_plan_line_item &&
                        item.trsp_plan_line_item?.length > 0 &&
                        item.trsp_plan_line_item[0].service_name}
                    </p>{' '}
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>区間</p>
                    <p className='font-normal leading-normal'>
                      {`出発地 ${getPrefectureName(regions, item?.departure_from)} ～ 経由地なし ～ 到着地 ${getPrefectureName(regions, item?.arrival_to)}`}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>運行日時</p>
                    <p className='font-normal leading-normal'>
                      {car?.service_strt_date ? dayjs(car?.service_strt_date).format(DATE_FORMAT.JAPANESE) : ''}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>持込時間</p>
                    <p className='font-normal leading-normal'>
                      出発時刻 {car?.service_strt_time ? formatTime(car?.service_strt_time, TIME_FORMAT.HH_MM_SS) : ''}{' '}
                      ～ 到着時刻
                      {car?.service_end_time ? formatTime(car?.service_end_time, TIME_FORMAT.HH_MM_SS) : ''}
                    </p>
                  </div>
                  <div className='flex items-start'>
                    <p className='w-36'>運行車両</p>
                    <div className='flex flex-col'>
                      <p className='font-normal leading-normal'>{car?.vehicle_name}</p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <p className='w-36'>受注運賃</p>
                    <div className='flex flex-col'>
                      <p className='font-normal leading-normal'>
                        {car?.freight_rate ? formatCurrency(`${car?.freight_rate} 円`) : ''}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center py-2'>この運行に登録された輸送計画</div>
                  <div className='flex items-center'>
                    <p className='w-36'>荷主</p>
                    <p className='font-normal leading-normal'>{item?.shipper_info?.operator_name}</p>{' '}
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>荷物</p>
                    <p className='font-normal leading-normal'>{item.transport_name}</p>
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>運送区間</p>
                    <p className='font-normal leading-normal'>
                      {`${getPrefectureName(regions, item?.departure_from)} ～ ${getPrefectureName(regions, item?.arrival_to)}`}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>温度帯</p>
                    <div className='flex flex-col'>
                      <p>
                        {item?.shipper_info?.temperature_range ? getCondition(item.shipper_info.temperature_range) : ''}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <p className='w-36'>希望輸送日時</p>
                    <p className='font-normal leading-normal'>
                      {item?.shipper_info?.collection_date
                        ? dayjs(item?.shipper_info.collection_date).format(DATE_FORMAT.JAPANESE)
                        : ''}{' '}
                      {item?.shipper_info?.collection_time_from &&
                        formatTime(item.shipper_info.collection_time_from, TIME_FORMAT.HHMM)}
                      {' - '}
                      {item?.shipper_info?.collection_time_to &&
                        formatTime(item.shipper_info.collection_time_to, TIME_FORMAT.HHMM)}
                    </p>
                  </div>
                  <div className='w-full pt-4'>メッセージ入力</div>
                  <div className='flex flex-col items-start mt-3'>
                    <p className='w-full text-xs text-other-gray'>※運行するメッセージを入力してください。</p>
                    <CmnTextarea
                      title=''
                      classNameWrap='w-[30.5rem] mt-2'
                      register={register}
                      name='comment'
                      defaultValue={!item.shipper_info ? '' : item.shipper_info.special_instructions?.toString()}
                      rules={{
                        // required: 'メッセージは必須です',
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
                  <div className='flex justify-end space-x-4'>
                    <Button
                      type='submit'
                      color='primary'
                      className='rounded-lg text-base font-bold h-12'
                      isDisabled={!isValid}
                    >
                      この内容でキャリア間予約する
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

export default ConditionProposalVehicleModal;
