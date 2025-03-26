'use client';
import { Button, Popover, PopoverContent, PopoverTrigger, Snippet } from '@nextui-org/react';
import { getCookie, setCookie } from 'cookies-next';

import { KEY_COOKIE_IS_NOT_IX } from '@/constants/keyStorage';
import { transactionService } from '@/services/transaction/transaction';

interface ButtonLinkHoverProps {
  title: string;
  hover: string;
  onPress: () => void;
}

const ButtonLinkHover = ({ title, hover, onPress }: ButtonLinkHoverProps) => {
  return (
    <Popover placement='top-end'>
      <PopoverTrigger>
        <Button
          radius='sm'
          color='primary'
          variant='light'
          className='text-base font-bold underline'
          title={hover}
          onPress={onPress}
        >
          {title}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Snippet symbol='#'>{hover}</Snippet>
      </PopoverContent>
    </Popover>
  );
};

const DevPage = () => {
  const transactionApi = transactionService();

  const handleMatchingShipper = () => {
    transactionApi.matchingShipper().then((res) => {
      showAlert({
        matching_not_good: res.data?.matching_not_good || 0,
        matching_ok: res.data?.matching_ok || 0,
      });
    });
  };

  const handleMatchingCarrier = () => {
    transactionApi.matchingCarrier().then((res) => {
      showAlert({
        matching_not_good: res.data?.matching_not_good || 0,
        matching_ok: res.data?.matching_ok || 0,
      });
    });
  };

  const handleMatchingCarrierBetween = () => {
    transactionApi.matchingCarrierBetween().then((res) => {
      showAlert({
        matching_not_good: res.data?.matching_not_good || 0,
        matching_ok: res.data?.matching_ok || 0,
      });
    });
  };

  const showAlert = ({ matching_not_good, matching_ok }: { matching_not_good: number; matching_ok: number }) => {
    alert(`Matching not good: ${matching_not_good}。Matching ok: ${matching_ok}。`);
  };

  const executeEmergencyMatching = () => {
    transactionApi.emergencyMatching().then((res) => {
      showAlert({
        matching_not_good: res.data?.matching_not_good || 0,
        matching_ok: res.data?.matching_ok || 0,
      });
    });
  };
  return (
    <div className='min-h-screen max-w-screen-xl min-w-96 flex-col mx-auto bg-white p-6'>
      <div className='flex items-center justify-between'>
        <ButtonLinkHover
          title='シッパー側のマッチング実行'
          hover={`${process.env.NEXT_PUBLIC_API_TRANSACTION}/matching/shipper/1000`}
          onPress={handleMatchingShipper}
        />
        <ButtonLinkHover
          title='キャリア側のマッチング実行'
          hover={`${process.env.NEXT_PUBLIC_API_TRANSACTION}/matching/carrier/1000`}
          onPress={handleMatchingCarrier}
        />
        <ButtonLinkHover
          title='キャリア間のマッチング実行'
          hover={`${process.env.NEXT_PUBLIC_API_TRANSACTION}/matching/carrier2/1000`}
          onPress={handleMatchingCarrierBetween}
        />
      </div>
      <div className='mt-4'>
        <Button color='primary' radius='sm' onPress={executeEmergencyMatching}>
          緊急マッチング実行
        </Button>
      </div>
    </div>
  );
};

export default DevPage;
