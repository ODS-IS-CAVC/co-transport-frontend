'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Chip, cn } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnInput from '@/components/common/CmnInput';
import CmnInputNumber from '@/components/common/CmnInputNumber';
import CmnTextarea from '@/components/common/CmnTextarea';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import {
  INIT_CARGO_INFO_SHIPPER,
  STATUS_CARGO,
  TEMPERATURE_RANGE,
  TEMPERATURE_RANGE_LIST_CARGO,
} from '@/constants/common';
import { OUT_PACKAGES } from '@/constants/shipper';
import { useAppDispatch } from '@/hook/useRedux';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { transportService } from '@/services/shipper/transportPlan';
import { ENotificationType } from '@/types/app';
import { CargoInfoForm } from '@/types/shipper/cargo';
import { TransportInfo, TransportPlanInfoRequest } from '@/types/shipper/transportList';

import TransportFormModal from '../transport-info/TransportFormModal';

interface ModalDetailInfoProps {
  isOpen: boolean;
  isRegister?: boolean;
  dataDetail: CargoInfoForm;
  onClose: () => void;
  setLoadingDetail: (loading: boolean) => void;
  onDelete?: (id: number) => void;
  onSubmit: (formValue: CargoInfoForm) => void;
}

const schema = yup.object({
  id: yup.string(),
  cargo_name: yup
    .string()
    .required(gTxt('VALIDATE.REQUIRED', { field: '品名' }))
    .max(20, gTxt('VALIDATE.MAX_LENGTH', { field: '品名', max: 20 })),
  outer_package_code: yup.number(),
  total_length: yup.number().nullable(),
  total_width: yup.number().nullable(),
  total_height: yup.number().nullable(),
  weight: yup.number().nullable(),
  temp_range: yup.array().of(yup.number().required()),
  status: yup.number().required(),
  special_instructions: yup.string().max(100, gTxt('VALIDATE.MAX_LENGTH', { field: 'コメント', max: 100 })),
});

const ModalDetailInfo = ({
  dataDetail = INIT_CARGO_INFO_SHIPPER,
  isRegister,
  onClose,
  onSubmit,
  isOpen = false,
  onDelete = () => null,
  setLoadingDetail,
}: ModalDetailInfoProps) => {
  const [isDetail, setIsDetail] = useState(false);
  const [formValue, setFormValue] = useState<CargoInfoForm>({ ...INIT_CARGO_INFO_SHIPPER });
  const [isOpenModalDetail, setIsOpenModalDetail] = useState<boolean>(false);
  const [detailTransportPlan, setDetailTransportPlan] = useState<TransportInfo>();
  const transportPlanApi = transportService();
  const dispatch = useAppDispatch();
  const {
    watch,
    reset,
    trigger,
    setValue,
    register,
    clearErrors,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formValue,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isRegister) {
      setIsDetail(true);
    }
  }, [isRegister]);

  useEffect(() => {
    if (dataDetail.id) {
      reset(dataDetail);
      setFormValue(dataDetail);
    }
  }, [dataDetail]);

  useEffect(() => {
    watch('temp_range');
  }, [watch]);

  const getDetailTransportPlan = async (id: number) => {
    return await transportPlanApi.transportPlanDetails(id);
  };

  const showDetailTransportPlan = async () => {
    if (dataDetail.transport_plan_id) {
      try {
        setLoadingDetail(true);
        const response = await getDetailTransportPlan(dataDetail.transport_plan_id);
        setDetailTransportPlan({ ...response });
        setIsOpenModalDetail(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const updateTransportPlan = (value: TransportPlanInfoRequest) => {
    if (value.transport_plan.id) {
      setLoadingDetail(true);
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
          setLoadingDetail(false);
        });
    }
    setDetailTransportPlan(undefined);
    setIsOpenModalDetail(false);
  };

  const callbackSubmit = (data: CargoInfoForm) => {
    onSubmit(data);
  };

  const renderDetail = (
    <div>
      <Chip
        className={cn('text-white text-base font-bold', dataDetail.status === 1 ? 'bg-other-gray' : 'bg-warning')}
        radius='sm'
      >
        {(STATUS_CARGO as Record<number, string>)[dataDetail.status]}
      </Chip>
      <div className='grid grid-cols-7 gap-8 my-10 text-base font-normal leading-7'>
        <div className='col-span-3'>
          <div className='flex items-center'>
            <span className='font-bold'>荷物ID</span>
            <span className='ml-2'>{dataDetail.id}</span>
          </div>
          <div className='mt-4 flex items-center gap-2'>
            <p className='font-bold min-w-fit'>品名</p>
            <span className='ml-2'>{dataDetail?.cargo_name}</span>
          </div>
          <div className='mt-4 flex items-center gap-2'>
            <p className='font-bold'>品目</p>
            <span className='ml-2'>
              {OUT_PACKAGES.find((item) => item.key === String(dataDetail?.outer_package_code))?.label}
            </span>
          </div>
          {dataDetail.status == 1 && (
            <div className='mt-4 flex items-center gap-2'>
              <p className='font-bold min-w-fit'>輸送計画ID</p>
              <span className='ml-2'>{dataDetail?.transport_plan_id}</span>
            </div>
          )}
          {dataDetail.status == 1 && (
            <div className='mt-4 flex items-center'>
              <Button
                className='text-base font-bold border-1'
                size='lg'
                variant='ghost'
                color='primary'
                radius='sm'
                onPress={showDetailTransportPlan}
              >
                輸送計画の詳細確認
              </Button>
            </div>
          )}
        </div>
        <div className='col-span-4'>
          <p className='font-bold'>荷物詳細</p>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>全長</p>
            <p>{dataDetail?.total_length || ''}</p>
            <p className='text-xs'>cm</p>
          </div>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>全幅</p>
            <p>{dataDetail?.total_width || ''}</p>
            <p className='text-xs'>cm</p>
          </div>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>全高</p>
            <p>{dataDetail?.total_height || ''}</p>
            <p className='text-xs'>cm</p>
          </div>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>重量</p>
            <p>{dataDetail?.weight || ''}</p>
            <p className='text-xs'>t</p>
          </div>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>湿度帯</p>
            <span className='ml-2'>
              {dataDetail.temp_range
                ?.map((item) => TEMPERATURE_RANGE[item as keyof typeof TEMPERATURE_RANGE])
                .join(', ')}
            </span>
          </div>
          <div className='mt-4 flex items-center gap-2 w-full'>
            <p className='font-bold min-w-fit'>備考</p>
            <p className='ml-2 whitespace-pre-wrap break-words break-all w-full'>
              {dataDetail?.special_instructions || ''}
            </p>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-between sticky bottom-0 pb-6 pt-2 bg-white'>
        <Button
          size='lg'
          radius='sm'
          color='primary'
          variant='ghost'
          onPress={onClose}
          className='text-base text-primary font-bold bg-background h-12 border-none'
        >
          閉じる
        </Button>
        <Button
          size='lg'
          radius='sm'
          color='primary'
          onPress={() => setIsDetail(false)}
          className='text- font-bold text-white h-12'
        >
          荷物情報を編集する
        </Button>
      </div>
      {isOpenModalDetail && (
        <TransportFormModal
          isOpen={isOpenModalDetail}
          modeEdit={true}
          detailData={detailTransportPlan}
          setLoadingDetail={setLoadingDetail}
          onClose={() => {
            setDetailTransportPlan(undefined);
            setIsOpenModalDetail(false);
          }}
          onSubmit={updateTransportPlan}
        />
      )}
    </div>
  );

  const renderForm = (
    <form onSubmit={handleSubmit(callbackSubmit)}>
      <div className='grid grid-cols-7 gap-8 my-6 text-base leading-7 font-normal'>
        <div className='col-span-3'>
          {isRegister ? (
            <React.Fragment />
          ) : (
            <div className='flex items-center'>
              <span className='font-bold'>荷物ID</span>
              <span className=''>{dataDetail?.id || ''}</span>
            </div>
          )}
          <div className='mt-4 flex items-center gap-2'>
            <p className='font-bold'>品名</p>
            <CmnInput
              size='md'
              name='cargo_name'
              register={register}
              classNameWrap='min-w-[11rem] w-[11rem]'
              errorMessage={errors.cargo_name?.message}
            />
          </div>
          <div className='mt-4 flex items-center gap-2'>
            <p className='font-bold'>品目</p>
            <CmnDropdown
              size='md'
              color='warning'
              items={OUT_PACKAGES}
              classNameWrap='min-w-[5rem] w-[5rem]'
              selectedKeys={[`${watch('outer_package_code')}`]}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                setValue('outer_package_code', value);
              }}
            />
          </div>
        </div>
        <div className='col-span-4'>
          <p className='text-[1.75rem] leading-[2.625rem] font-normal'>荷物詳細</p>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>全長</p>
            <CmnInput
              size='md'
              name='total_length'
              classNameWrap='w-[11rem]'
              value={`${watch('total_length') || ''}`}
              endContent={<p className='text-xs font-normal leading-[1.313rem]'>cm</p>}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                setValue('total_length', value);
              }}
            />
          </div>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>全幅</p>
            <CmnInput
              size='md'
              name='total_width'
              classNameWrap='w-[11rem]'
              value={`${watch('total_width') || ''}`}
              endContent={<p className='text-xs font-normal leading-[1.313rem]'>cm</p>}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                setValue('total_width', value);
              }}
            />
          </div>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>全高</p>
            <CmnInput
              size='md'
              name='total_height'
              classNameWrap='w-[11rem]'
              value={`${watch('total_height') || ''}`}
              endContent={<p className='text-xs font-normal leading-[1.313rem]'>cm</p>}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                setValue('total_height', value);
              }}
            />
          </div>
          <div className='flex gap-3 mt-3 items-center'>
            <p className='font-bold'>重量</p>
            <CmnInputNumber
              size='md'
              name='weight'
              classNameWrap='w-[11rem]'
              value={`${watch('weight') || ''}`}
              endContent={<p className='text-xs font-normal leading-[1.313rem]'>t</p>}
              setValue={(name, value) => setValue('weight', value)}
            />
          </div>
          <div className='mt-4'>
            <p className='text-primary font-normal leading-tight tracking-wide'>湿度帯</p>
            <CmnCheckboxGroup
              size='md'
              title=''
              classNameWrap='mt-4'
              option={TEMPERATURE_RANGE_LIST_CARGO}
              value={watch('temp_range')?.map(String) || []}
              onChange={(value: string[]) => {
                setValue('temp_range', value.map(Number));
              }}
            />
          </div>
          <CmnTextarea
            title='コメント'
            maxLength={100}
            classNameWrap='mt-3'
            register={register}
            clearErrors={clearErrors}
            name='special_instructions'
            defaultValue={watch('special_instructions') || ''}
            errorMessage={errors.special_instructions?.message}
            onValueChange={(value: string) => {
              setValue('special_instructions', value);
              trigger('special_instructions');
            }}
          />
        </div>
      </div>
      <div className='flex items-center justify-between sticky bottom-0 pb-6 pt-2 bg-white'>
        <Button
          size='lg'
          radius='sm'
          color='primary'
          variant='ghost'
          onPress={onClose}
          className='text-base text-primary font-bold bg-background mr-4 border-none'
        >
          登録を中止
        </Button>
        <div className='flex items-center gap-4'>
          {!isRegister && (
            <Button
              size='lg'
              radius='sm'
              onPress={() => onDelete(Number(dataDetail?.id))}
              className='text-base font-bold border-1 border-error text-error bg-white'
            >
              荷物情報を削除する
            </Button>
          )}
          <Button
            className='font-bold text-white'
            size='lg'
            color='primary'
            radius='sm'
            type='submit'
            isDisabled={!isValid}
          >
            {isRegister ? '保存する' : '編集を完了する'}
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <CmnModal size='2xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader
        description='登録した荷物情報の確認ができます。'
        title={isDetail ? '荷物情報の詳細' : isRegister ? '荷物情報の新規登録' : '荷物情報の編集'}
      />
      <CmnModalBody classNames='py-0'>{isDetail ? renderDetail : renderForm}</CmnModalBody>
    </CmnModal>
  );
};

export default ModalDetailInfo;
