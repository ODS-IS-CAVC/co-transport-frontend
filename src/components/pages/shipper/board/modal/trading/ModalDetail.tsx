'use client';

import { Skeleton } from '@nextui-org/react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnTextarea from '@/components/common/CmnTextarea';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TEMPERATURE_RANGE_LIST } from '@/constants/common';
import { ITransportPlanSale } from '@/types/shipper/transport';

import ItemTrading from '../../ItemTrading';

interface ModalDetailProps {
  onClose: () => void;
  onSubmit: () => void;
  dataItem?: ITransportPlanSale;
}

const ModalDetail = ({ onClose, onSubmit, dataItem }: ModalDetailProps) => {
  const filteredOptions = TEMPERATURE_RANGE_LIST.slice(1).filter((option) =>
    dataItem?.temperatureRange?.map((v) => String(v)).includes(option.value),
  );
  return (
    <>
      <CmnModalHeader
        title='輸送計画の詳細'
        description={'輸送計画の詳細や進行状況が確認できます。'}
        classNames='mb-0 px-8 pt-8'
        classNamesTitle='mb-8'
      />
      <CmnModalBody classNames='px-8 pt-8'>
        <ItemTrading isModal dataItem={dataItem} />
        <div className='flex gap-8'>
          <div className='max-w-[21.875rem] w-full'>
            <p className='text-foreground text-sm font-normal leading-tight tracking-wide'>荷物詳細</p>
            <div className='flex justify-between max-w-[16.9375rem] w-full items-center mt-[10px]'>
              <span className='text-primary text-sm font-normal leading-tight tracking-wide'>荷物全長</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-40 h-6 rounded-lg' />
              ) : (
                <span className='rounded-lg border border-default w-40 h-6 px-2 flex items-center justify-between'>
                  <span className='text-sm'>{dataItem.total_length}</span>
                  <p className='text-xs font-normal leading-[1.313rem]'>cm</p>
                </span>
              )}
            </div>
            <div className='flex justify-between max-w-[16.9375rem] w-full items-center mt-2'>
              <span className='text-primary text-sm font-normal leading-tight tracking-wide'>荷物全幅</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-40 h-6 rounded-lg' />
              ) : (
                <span className='rounded-lg border border-default w-40 h-6 px-2 flex items-center justify-between'>
                  <span className='text-sm'>{dataItem.total_width}</span>
                  <p className='text-xs font-normal leading-[1.313rem]'>cm</p>
                </span>
              )}
            </div>
            <div className='flex justify-between max-w-[16.9375rem] w-full items-center mt-2'>
              <span className='text-primary text-sm font-normal leading-tight tracking-wide'>荷物全高</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-40 h-6 rounded-lg' />
              ) : (
                <span className='rounded-lg border border-default w-40 h-6 px-2 flex items-center justify-between'>
                  <span className='text-sm'>{dataItem.total_height}</span>
                  <p className='text-xs font-normal leading-[1.313rem]'>cm</p>
                </span>
              )}
            </div>
            <div className='flex justify-between max-w-[16.9375rem] w-full items-center mt-2'>
              <span className='text-primary text-sm font-normal leading-tight tracking-wide'>重量</span>
              {!dataItem ? (
                <Skeleton as={'span'} className='w-40 h-6 rounded-lg' />
              ) : (
                <span className='rounded-lg border border-default w-40 h-6 px-2 flex items-center justify-between'>
                  <span className='text-sm'>{dataItem.weight}</span>
                  <p className='text-xs font-normal leading-[1.313rem]'>t</p>
                </span>
              )}
            </div>
            <p className='text-primary text-sm font-normal leading-tight tracking-wide my-3'>湿度帯</p>
            <CmnCheckboxGroup
              value={dataItem?.temperatureRange?.map((v) => String(v))}
              size='sm'
              title=''
              isReadOnly
              option={filteredOptions}
            />
          </div>
          <CmnTextarea
            name='special_instructions'
            className='max-w-[20.4375rem] w-full'
            classNameWrap='mt-3 max-w-[20.4375rem] w-full pointer-events-none'
            title='コメント'
            readOnly
            defaultValue={!dataItem ? '' : dataItem.special_instructions || ''}
            maxLength={100}
          />
        </div>
      </CmnModalBody>
      <CmnModalFooter
        classNames='px-8 pb-8'
        buttonRightFirst={{
          children: '条件の近い便を検索する',
          className: 'w-auto',
          color: 'primary',
          onPress: onSubmit,
        }}
        buttonLeftFirst={{
          children: '閉じる',
          className: 'border-none bg-background underline font-bold',
          onPress: onClose,
        }}
      />
    </>
  );
};

export default ModalDetail;
