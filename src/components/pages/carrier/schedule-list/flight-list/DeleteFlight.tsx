'use client';

import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { useAppDispatch } from '@/hook/useRedux';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType } from '@/types/app';

const deleteItemFlight = async ({ id }: { id: number }) => {
  const vehicleCarrierApi = scheduleCarrierService();
  const result = await vehicleCarrierApi.deleteItemFlight(id);
  return result;
};

interface DeleteFlightProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  onCloneFather: () => void;
}

function DeleteFlight({ id, isOpen = false, onClose = () => null, onCloneFather = () => null }: DeleteFlightProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isNoDelete, setIsNoDelete] = useState(false);

  const showError = () => {
    dispatch(
      actions.appAction.showModalResult({
        type: ENotificationType.ERROR,
        title: 'フライトの削除中にエラーが発生しました',
        content: gTxt('MESSAGES.FAILED'),
      }),
    );
  };

  const handleDelete = () => {
    setLoading(true);
    deleteItemFlight({ id })
      .then((response) => {
        if (response && response?.status && response?.status !== 200) {
          showError();
        } else {
          setIsDelete(true);
          router.refresh();
        }
      })
      .catch(() => showError())
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <>
      {isOpen && (
        <CmnModal isOpen={isOpen} onClose={onClose}>
          <CmnModalHeader title='運行便削除' description='運行便を削除します。' />
          <CmnModalBody>
            <div className='text-sm font-normal leading-[1.531rem] flex flex-col'>
              <p>削除を実行すると、運行便から削除されますので、操作には十分ご注意ください。</p>
              <p>※過去の取引詳細には情報が保持されます。</p>
              <p className='mt-4'>運行便削除を実行します。よろしいですか?</p>

              <Button
                radius='sm'
                color='primary'
                isDisabled={loading}
                onPress={() => {
                  onClose();
                  setIsNoDelete(true);
                }}
                variant='ghost'
                className='h-12 w-[14.5rem] mt-4 text-base font-bold leading-6 bg-background border-none'
              >
                運行便の削除を実行しない
              </Button>
              <Button
                radius='sm'
                isLoading={loading}
                onPress={handleDelete}
                className='h-12 mt-4 w-[13.438rem] text-base font-bold leading-6 border-error border-1 bg-white text-error'
              >
                運行便の削除を実行する
              </Button>
            </div>
          </CmnModalBody>
          <CmnModalFooter
            buttonLeftFirst={{
              onPress: onClose,
              children: '閉じる',
              isDisabled: loading,
              className: 'border-1 text-base font-bold px-4 border-none bg-background',
            }}
          />
        </CmnModal>
      )}
      {isNoDelete && (
        <CmnModal isOpen={isNoDelete} onClose={() => setIsNoDelete(false)}>
          <CmnModalHeader title='運行便削除中止' description='運行便削除を中止しました。' />
          <CmnModalBody className='text-sm font-normal leading-[1.531rem]'>
            <p>閉じるボタンで運行便詳細画面に戻ります。</p>
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
          <CmnModalHeader title='運行便削除完了' description='運行便削除を完了しました。' />
          <CmnModalBody className='text-sm font-normal leading-[1.531rem]'>
            <p>閉じるボタンで運行便画面に戻ります。</p>
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

export default DeleteFlight;
