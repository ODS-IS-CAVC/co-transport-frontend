'use client';

import { Button, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';

import CmnFileUpload, { Files } from '@/components/common/CmnFileUpload';

interface ModalRegisterBulkPackagesProps {
  onClose: () => void;
  showModalAboutRegister: () => void;
  handleSubmit: () => void;
  handleFileSuccess: (flies: Files[]) => void;
}

const ModalRegisterBulkPackages = ({
  onClose = () => null,
  handleSubmit = () => null,
  handleFileSuccess = () => null,
  showModalAboutRegister = () => null,
}: ModalRegisterBulkPackagesProps) => {
  return (
    <ModalContent>
      <ModalHeader className='!p-8 text-4xl font-normal leading-[3.15rem]'>荷物情報の一括登録</ModalHeader>
      <ModalBody className='!px-8'>
        <p className='text-xs'>一括登録テンプレートを使用して荷物情報の一括登録を行えます。</p>
        <div className='flex gap-8 mt-10 justify-center'>
          <CmnFileUpload
            getFileSuccess={handleFileSuccess}
            // extend={{ maxFile: 2, maxSize: 10, notAllowedTypes: ['jpg', 'pdf'] }}
          />
        </div>
      </ModalBody>
      <ModalFooter className='!px-8 mt-10'>
        <Button
          className='text-base text-primary bg-background font-bold px-8 h-12 mr-auto'
          size='sm'
          radius='sm'
          onPress={onClose}
        >
          閉じる
        </Button>
        <Button
          className='text-base text-primary font-bold px-8 h-12 border-1 mr-2'
          size='sm'
          color='primary'
          variant='bordered'
          radius='sm'
          onPress={showModalAboutRegister}
        >
          一括登録テンプレートについて
        </Button>
        <Button
          className='text-base text-neutral font-bold px-8 h-12'
          size='sm'
          color='primary'
          radius='sm'
          onPress={handleSubmit}
        >
          アップロードを保存する
        </Button>
      </ModalFooter>
    </ModalContent>
  );
};

export default ModalRegisterBulkPackages;
