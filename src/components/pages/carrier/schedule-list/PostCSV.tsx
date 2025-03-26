'use client';
import { Button } from '@nextui-org/react';
import { useState } from 'react';

import CmnFileUpload, { Files } from '@/components/common/CmnFileUpload';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { TEMPLATE_CSV } from '@/constants/common';
import { useAppDispatch } from '@/hook/useRedux';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { scheduleCarrierService } from '@/services/carrier/schedule';
import { ENotificationType } from '@/types/app';

const scheduleDownloadCSV = async () => {
  const scheduleApi = scheduleCarrierService();
  return await scheduleApi.scheduleDownloadCSV();
};

const deliveryAbilityPostCSV = async ({ file }: { file: File }) => {
  const scheduleApi = scheduleCarrierService();
  const result = await scheduleApi.createDeliveryAbilityCSV(file);
  return result;
};

interface PostCSVProps {
  isOpen: boolean;
  onClose: () => void;
}

function PostCSV(props: PostCSVProps) {
  const { isOpen = false, onClose = () => null } = props;
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [openFileSuccess, setOpenFileSuccess] = useState(false);

  const [files, setFiles] = useState<Files[]>([]);

  const handleDownload = () => {
    const showError = () => {
      dispatch(
        actions.appAction.showModalResult({
          type: ENotificationType.ERROR,
          title: gTxt('MESSAGES.FAILED'),
          content: gTxt('MESSAGES.FAILED'),
        }),
      );
    };

    setLoadingDownload(true);
    scheduleDownloadCSV()
      .then((response: any) => {
        if (response && response?.status && response?.status !== 200) {
          showError();
        } else {
          const binaryString = atob(response?.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', TEMPLATE_CSV.DIAGRAM);
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      })
      .catch((error) => {
        showError();
        console.log('[ERROR] === scheduleDownloadCSV ====>:', error);
      })
      .finally(() => {
        setLoadingDownload(false);
      });
  };

  const handleUploadCSV = () => {
    if (!files?.length) return;

    const showError = (error: any) => {
      console.log('[ERROR] = scheduleListPostCSV:', error);
      dispatch(
        actions.appAction.showNotification({
          type: ENotificationType.ERROR,
          title: gTxt('CSV.TITLE_ERROR'),
          content: gTxt('CSV.CONTENT_ERROR'),
        }),
      );
    };
    setLoading(true);
    deliveryAbilityPostCSV({ file: files[0].file })
      .then((response) => {
        if (response && response?.status && response?.status !== 200) {
          showError(response.status);
        } else {
          setOpenFileSuccess(true);
          dispatch(
            actions.appAction.showNotification({
              type: ENotificationType.SUCCESS,
              title: gTxt('CSV.TITLE_SUCCESS'),
              content: gTxt('CSV.CONTENT_SUCCESS'),
            }),
          );
        }
      })
      .catch((error) => showError(error))
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <>
      {isOpen && (
        <CmnModal size='2xl' isOpen={isOpen} onClose={onClose}>
          <CmnModalHeader
            title='運行スケジュールの一括登録'
            description='テンプレートを使用して運行スケジュールの一括登録用csvファイルアップロードします。'
          />
          <CmnModalBody>
            <div className='flex flex-col items-center'>
              <Button
                color='primary'
                variant='ghost'
                onPress={handleDownload}
                isLoading={loadingDownload}
                className='border-1 border-primary p-2 rounded-lg text-primary font-bold text-base px-4 h-12'
              >
                一括登録用のテンプレート（CSVファイル）をダウンロードする
              </Button>
              <CmnFileUpload
                classNameWrap='w-[22.938rem] mt-6'
                getFileSuccess={(file) => setFiles(file)}
                extend={{ maxFile: 1, maxSize: 5, allowedTypes: ['csv'] }}
              />
            </div>
          </CmnModalBody>
          <CmnModalFooter
            buttonLeftFirst={{
              onPress: onClose,
              children: '閉じる',
              className: 'text-base font-bold w-[6.125rem] border-none bg-background',
            }}
            buttonRightSecond={{
              isLoading: loading,
              onPress: handleUploadCSV,
              children: 'アップロードを保存する',
              className: 'text-base font-bold leading-6 px-4 bg-primary text-white',
            }}
          />
        </CmnModal>
      )}

      {openFileSuccess && (
        <CmnModal size='2xl' isOpen={openFileSuccess} onClose={() => setOpenFileSuccess(false)}>
          <CmnModalHeader
            title='csvファイルアップロード'
            description='運行スケジュールの一括登録用csvファイルアップロードが完了しました。'
          />
          <CmnModalBody>
            <p className='py-6 text-xs font-normal leading-[1.313rem]'>
              一括登録した内容は運行スケジュール一覧からご確認いただけます。
            </p>
          </CmnModalBody>
          <CmnModalFooter
            buttonLeftFirst={{
              children: '閉じる',
              onPress: () => setOpenFileSuccess(false),
              className: 'border-1 text-base font-bold w-[6.125rem] border-none bg-background',
            }}
            buttonRightSecond={{
              children: '運行スケジュール一覧へ',
              onPress: () => setOpenFileSuccess(false),
              className: 'text-base font-bold leading-6 px-4 bg-primary text-white',
            }}
          />
        </CmnModal>
      )}
    </>
  );
}

export default PostCSV;
