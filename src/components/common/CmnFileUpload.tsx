'use client';

import { Button } from '@nextui-org/react';
import React, { memo, useCallback, useState } from 'react';

import CloudUpload from '@/icons/CloudUpload';
import { generateUniqueId } from '@/lib/helper';
import { cn } from '@/lib/utils';

import { Icon } from './Icon';
import CmnModal from './modal/CmnModal';
import CmnModalBody from './modal/CmnModalBody';
import CmnModalFooter from './modal/CmnModalFooter';
import CmnModalHeader from './modal/CmnModalHeader';

export const DEFAULT_EXTEND = {
  maxFile: 10, // Maximum number of files in a single upload
  maxSize: 10, // Each file has a maximum size of 10MB
};

export enum statusFile {
  'error',
  'success',
  'uploading',
}

export interface Files {
  id: string;
  file: File;
  progress: number;
  status: statusFile;
}

interface CmnFileUploadProps {
  classNameWrap?: string;
  classNameWrapFiles?: string;
  getFileSuccess?: (files: Files[]) => void;
  extend?: {
    maxFile: number;
    maxSize: number;
    allowedTypes?: string[]; // Only allow files to be uploaded in the specified format, e.g., "jpg, pdf"
    notAllowedTypes?: string[]; // Does not allow files within notAllowedTypes to be uploaded, e.g., "jpg, pdf"
  };
}

function CmnFileUpload(props: CmnFileUploadProps) {
  const {
    classNameWrap,
    classNameWrapFiles,
    getFileSuccess = () => null,
    extend = {
      maxFile: DEFAULT_EXTEND.maxFile,
      maxSize: DEFAULT_EXTEND.maxSize,
    },
  } = props;

  const [files, setFiles] = useState<Files[]>([]);

  // Drag and drop status
  const [isDragging, setIsDragging] = useState(false);

  const [isButton, setIsButton] = useState(false);

  const [modal, setModal] = useState<{ open: boolean; message: string | React.ReactNode }>({
    open: false,
    message: '',
  });

  const statusFileError = statusFile.error;
  const statusFileSuccess = statusFile.success;
  const statusFileUploading = statusFile.uploading;

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles?.filter((file) => {
      const fileExtension = (file?.name || '').split('.').pop() || ''; // Get the file extension, e.g., .jpg

      if (extend?.allowedTypes && !extend?.allowedTypes?.includes(fileExtension)) {
        handleUpdateModal(
          true,
          <div className='font-bold'>
            <p>
              <span className='text-error'>{file.name}</span> は有効なファイル タイプではありません。
            </p>
            <p>
              許可されたタイプ: <span className='text-error'>{extend?.allowedTypes.join(', ')}</span>
            </p>
          </div>,
        );
        return false;
      }

      if (extend?.notAllowedTypes && extend?.notAllowedTypes && extend?.notAllowedTypes?.includes(fileExtension)) {
        handleUpdateModal(
          true,
          <div className='font-bold'>
            <p>
              <span className='text-error'>{file?.name}</span> は有効なファイル タイプではありません。
            </p>
            <p>
              無効なタイプ: <span className='text-error'>{extend?.notAllowedTypes?.join(', ')}</span>
            </p>
          </div>,
        );
        return false; // Do not add invalid file
      }

      if (file?.size > extend?.maxSize * 1024 * 1024) {
        // Check if the file is valid (size does not exceed 10MB)
        handleUpdateModal(
          true,
          <div className='font-bold'>
            <span className='text-error'>{file?.name}</span> {extend?.maxSize}MBを超えます。
          </div>,
        );
        // Do not add this file to the valid list
        return false;
      }
      // File is valid
      return true;
    });

    if (files?.length + validFiles?.length > extend?.maxFile) {
      return handleUpdateModal(true, `アップロードできるファイルは最大 ${extend?.maxFile} 個までです。`);
    }

    handleUpdateIsButton(false);
    validFiles.forEach((file) => simulateUpload(file));
  };

  // Activate drag and drop status
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // End drag and drop status
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      const fileExtension = (file.name || '').split('.').pop() || ''; // Get the file extension, e.g., .jpg

      if (extend?.allowedTypes && !extend?.allowedTypes?.includes(fileExtension)) {
        handleUpdateModal(
          true,
          <div className='font-bold'>
            <p>
              <span className='text-error'>{file?.name}</span> は有効なファイル タイプではありません。
            </p>
            <p>
              許可されたタイプ: <span className='text-error'>{extend?.allowedTypes?.join(', ')}</span>
            </p>
          </div>,
        );
        return false;
      }
      if (extend?.notAllowedTypes && extend?.notAllowedTypes && extend?.notAllowedTypes?.includes(fileExtension)) {
        handleUpdateModal(
          true,
          <div className='font-bold'>
            <p>
              <span className='text-error'>{file?.name}</span> は有効なファイル タイプではありません。
            </p>
            <p>
              無効なタイプ: <span className='text-error'>{extend?.notAllowedTypes?.join(', ')}</span>
            </p>
          </div>,
        );
        return false; // Do not add invalid file
      }

      if (file?.size > extend?.maxSize * 1024 * 1024) {
        // Check if the file is valid (size does not exceed 10MB)
        handleUpdateModal(
          true,
          <div className='font-bold'>
            <span className='text-error'>{file?.name}</span> {extend?.maxSize}MBを超えます。
          </div>,
        );
        // Do not add this file to the valid list
        return false;
      }
      // File is valid
      return true;
    });

    if (files?.length + validFiles?.length > extend?.maxFile) {
      return handleUpdateModal(true, `アップロードできるファイルは最大 ${extend?.maxFile} 個までです。`);
    }

    handleUpdateIsButton(false);
    validFiles.forEach((file) => simulateUpload(file));

    // Reset input value after processing
    e.target.value = '';
  };

  // Call getFileSuccess only when there are changes in successful files
  const handleFileSuccess = useCallback(
    (updatedFiles: Files[]) => {
      const successFiles = updatedFiles?.filter((file) => file?.status === statusFileSuccess);
      successFiles?.length && getFileSuccess(successFiles);
    },
    [getFileSuccess],
  );

  // Simulate file upload
  const simulateUpload = (file: File) => {
    const id = generateUniqueId();
    const newFile: Files = {
      id,
      file,
      progress: 0,
      status: statusFileUploading,
    };

    setFiles((prevFiles) => [...prevFiles, newFile]);

    const interval = setInterval(() => {
      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if (f.id === id && f.progress < 100) {
            return {
              ...f,
              progress: f.progress + 10,
              status: f.progress + 10 === 100 ? statusFileSuccess : statusFileUploading,
            };
          }
          return f;
        }),
      );
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      const isError = Math.random() < 0.2; // 20% error
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.map((f) =>
          f.id === id ? { ...f, status: isError ? statusFileError : statusFileSuccess } : f,
        );
        handleFileSuccess(updatedFiles);
        return updatedFiles;
      });
    }, 5000);
  };

  // Remove file
  const handleRemoveFile = (id: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  // Format file size
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} bytes`;
    else if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    else if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    else return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const fileUploading = files.filter((item) => item.status === statusFileUploading) || [];
  const fileError = files.filter((item) => item.status === statusFileError) || [];
  const fileSuccess = files.filter((item) => item.status === statusFileSuccess) || [];

  const onOpenChange = () => {
    handleUpdateModal(false, '');
  };

  const handleUpdateModal = (isOpen: boolean, messageNotification: string | React.ReactNode) => {
    setModal({
      open: isOpen,
      message: messageNotification,
    });
  };

  const handleUpdateIsButton = (status: boolean) => {
    setIsButton(status);
  };

  const showItemFIle = (itemFile: Files, status: statusFile) => {
    const statusError = status === statusFileError;
    const statusSuccess = status === statusFileSuccess;
    const statusUploading = status === statusFileUploading;

    return (
      <div className='flex items-center border-1 p-3 rounded-lg drop-shadow-lg w-full mt-4 bg-white'>
        <Icon
          size={30}
          icon={statusSuccess ? 'check_circle' : statusError ? 'error' : 'progress_activity'}
          className={cn(
            'mr-4',
            statusError && 'text-error',
            statusSuccess && 'text-success',
            statusUploading && 'animate-spin text-[#4eafff]',
          )}
        />
        <div className='mr-4'>
          <p
            className='text-sm font-semibold w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap'
            title={itemFile?.file?.name || ''}
          >
            {itemFile?.file?.name || ''}
          </p>
          <p className='text-xs text-gray-border mt-1'>ファイルサイズ : {formatFileSize(itemFile.file.size || 0)}</p>
        </div>

        <div className='flex-1 mr-4'>
          <div className='flex flex-col items-end justify-end'>
            <p className='text-xs text-gray-border'>{statusSuccess ? 100 : itemFile?.progress || 0} %</p>
            <div className='w-full min-w-12 rounded-lg mt-1 border-1 p-1'>
              <div
                className={`
                    rounded-lg transition-width duration-200 h-2
                     ${statusSuccess ? '!bg-success' : statusError ? '!bg-error' : '!bg-[#53B0FD]'}

                  `}
                style={{ width: `${statusSuccess ? 100 : itemFile?.progress || 0}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <Button
            size='sm'
            variant='bordered'
            onPress={() => handleRemoveFile(itemFile.id)}
            className='border-1 rounded-full px-0 min-w-8 text-gray-border'
          >
            {statusUploading ? '✖' : <Icon icon='delete' size={18} className='text-gray-border' />}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={cn('min-w-[25rem]', classNameWrap)}>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'w-full border-1 border-primary border-dashed rounded-2xl py-8 flex flex-col items-center',
            isDragging ? 'bg-[#f9f9f9]' : 'bg-background',
          )}
        >
          <CloudUpload />

          {fileUploading.length ? (
            <p className='text-base font-bold leading-6 text-[#757575] mt-28'>アップロード中...</p>
          ) : fileError.length && !isButton ? (
            <>
              <div className='flex flex-col items-center text-error mt-3 font-normal text-base leading-7'>
                <p>アップロードに失敗しました</p>
                <p>正しいファイル形式か確認してください</p>
              </div>
              <Button
                color='primary'
                variant='bordered'
                onPress={() => setFiles([])}
                className='h-12 mt-6 px-5 rounded-lg text-base font-bold leading-[1.5rem] border-1 bg-white'
              >
                やりなおす
              </Button>
            </>
          ) : fileSuccess.length && !isButton ? (
            <>
              <p className='text-base mt-3 font-normal leading-[1.75rem] text-success'>アップロードが完了しました</p>
              <Button
                color='primary'
                onPress={() => handleUpdateIsButton(true)}
                className='h-12 w-[8.5rem] mt-6 rounded-lg text-base font-bold leading-[1.5rem]'
              >
                ok
              </Button>
            </>
          ) : (
            <>
              <p className='text-base mt-3 font-normal leading-[1.75rem] text-[#000]'>ここにファイルをドラッグ</p>
              <span className='text-sm font-normal leading-[1.75rem] text-[#000]'>または</span>
              <input type='file' id='file-upload' multiple className='hidden' onChange={handleFileChange} />
              <Button
                color='primary'
                onPress={() => document.getElementById('file-upload')?.click()}
                className='h-12 mt-6 px-3 rounded-lg text-base font-bold leading-[1.5rem]'
              >
                ファイルを選択
              </Button>
            </>
          )}
        </div>

        <div className={classNameWrapFiles}>
          {fileUploading.length > 0 && (
            <div className='mt-5'>
              <p className='font-semibold text-base'>アップロード中</p>
              {fileUploading.map((itemFile) => (
                <React.Fragment key={itemFile?.id}>{showItemFIle(itemFile, itemFile?.status)}</React.Fragment>
              ))}
            </div>
          )}

          {fileError.length > 0 && (
            <div className='mt-5'>
              <p className='font-semibold text-base'>ファイルの読み込みに失敗しました</p>
              {fileError.map((itemFile) => (
                <React.Fragment key={itemFile?.id}>{showItemFIle(itemFile, itemFile?.status)}</React.Fragment>
              ))}
            </div>
          )}

          {fileSuccess.length > 0 && (
            <div className='mt-5'>
              <p className='font-semibold text-base'>アップロード済み</p>
              {fileSuccess.map((itemFile) => (
                <React.Fragment key={itemFile?.id}>{showItemFIle(itemFile, itemFile?.status)}</React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
      <CmnModal isOpen={modal?.open} size='lg' onClose={onOpenChange}>
        <CmnModalHeader title='通知' description='' />
        <CmnModalBody classNames='min-h-fit'>
          {typeof modal?.message === 'string' ? <p className='font-bold'>{modal?.message}</p> : <>{modal?.message}</>}
        </CmnModalBody>
        <CmnModalFooter
          buttonLeftFirst={{
            children: '閉じる',
            onPress: onOpenChange,
            className: 'text-base font-bold border-none bg-background',
          }}
        />
      </CmnModal>
    </>
  );
}

export default memo(CmnFileUpload);
