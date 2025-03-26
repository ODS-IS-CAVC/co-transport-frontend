'use client';

import { Button } from '@nextui-org/react';
import { useState } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { useAppDispatch } from '@/hook/useRedux';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { vehicleCarrierService } from '@/services/carrier/vehicle';
import { ENotificationType } from '@/types/app';

const vehicleDelete = async ({ id }: { id: number }) => {
  const vehicleCarrierApi = vehicleCarrierService();
  const result = await vehicleCarrierApi.vehicleDelete(id);
  return result;
};

interface VehicleDeleteProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  fetchData: () => void;
  onCloneFather: () => void;
}
function VehicleDelete(props: VehicleDeleteProps) {
  const { id, isOpen = false, onClose = () => null, fetchData = () => null, onCloneFather = () => null } = props;
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isNoDelete, setIsNoDelete] = useState(false);

  const handleDelete = () => {
    const showError = () => {
      dispatch(
        actions.appAction.showModalResult({
          type: ENotificationType.ERROR,
          title: gTxt('MENU.CARRIER.VEHICLE_DELETE.TITLE_ERROR'),
          content: gTxt('MENU.CARRIER.VEHICLE_DELETE.CONTENT_ERROR'),
        }),
      );
    };
    setLoading(true);
    vehicleDelete({ id })
      .then((response) => {
        if (response && response?.status && response?.status !== 200) {
          showError();
        } else {
          setIsDelete(true);
          fetchData();
        }
      })
      .catch(() => {
        showError();
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <>
      <CmnModal isOpen={isOpen} onClose={onClose}>
        <CmnModalHeader title='車両情報削除' description='車両情報を削除します。' />
        <CmnModalBody className='text-sm font-normal leading-[1.531rem]'>
          <p>削除を実行すると、運送能力・車両情報から削除されるとともに、</p>
          <p>運行スケジュール・運行便の車両割り当てからも削除されますので、操作には十分ご注意ください。</p>
          <p className='mt-4'>車両情報削除を実行します。よろしいですか?</p>
          <Button
            radius='sm'
            color='primary'
            variant='ghost'
            isDisabled={loading}
            onPress={() => {
              onClose();
              setIsNoDelete(true);
            }}
            className='px-4 h-12 w-[15.5rem] border-1 font-bold text-base mt-4 bg-background border-none'
          >
            車両情報の削除を実行しない
          </Button>
          <Button
            radius='sm'
            isLoading={loading}
            onPress={handleDelete}
            className='px-4 h-12 w-[14.5rem] border-1 font-bold text-base border-error bg-white text-error mt-2'
          >
            車両情報の削除を実行する
          </Button>
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            onPress: onClose,
            isDisabled: loading,
            className: 'border-none rounded-lg font-bold w-[7.125rem] bg-background',
          }}
        />
      </CmnModal>
      {isNoDelete && (
        <CmnModal isOpen={isNoDelete} onClose={() => setIsNoDelete(false)}>
          <CmnModalHeader title='車両情報削除中止' description='車両情報削除を中止しました。' />
          <CmnModalBody className='text-sm font-normal leading-[1.531rem]'>
            <p>閉じるボタンで車両情報画面に戻ります。</p>
          </CmnModalBody>
          <CmnModalFooter
            buttonLeftFirst={{
              children: '閉じる',
              onPress: onCloneFather,
              className: 'border-none rounded-lg font-bold w-[7.125rem] bg-background',
            }}
          />
        </CmnModal>
      )}

      {isDelete && (
        <CmnModal isOpen={isDelete} onClose={() => setIsDelete(false)}>
          <CmnModalHeader title='車両情報削除完了' description='車両情報削除を完了しました。' />
          <CmnModalBody className='text-sm font-normal leading-[1.531rem]'>
            <p>閉じるボタンで運送能力・車両情報画面に戻ります。</p>
          </CmnModalBody>
          <CmnModalFooter
            buttonLeftFirst={{
              children: '閉じる',
              onPress: onCloneFather,
              className: 'border-none rounded-lg font-bold w-[7.125rem] bg-background',
            }}
          />
        </CmnModal>
      )}
    </>
  );
}

export default VehicleDelete;
