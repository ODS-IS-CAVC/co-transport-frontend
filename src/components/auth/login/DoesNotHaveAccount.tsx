'use client';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';

import { ROUTER } from '@/constants/router/router';
import { cn } from '@/lib/utils';

interface DoesNotHaveAccountProps {
  className?: string;
}

function DoesNotHaveAccount(props: DoesNotHaveAccountProps) {
  const { className } = props;

  const router = useRouter();

  return (
    <div className={cn('border border-primary rounded-lg p-4 text-[#000000] font-normal', className)}>
      <h3 className='leading-[2.625rem]'>アカウントを持っていない</h3>
      <p className='text-[0.75rem] leading-[1.313rem] mt-6'>
        アカウントをログインしないで試しに使う場合は、テストユーザーとしてこちらからログインしてください(機能は制限されます)。
      </p>
      <Button
        fullWidth
        color='primary'
        variant='bordered'
        className='mt-4 h-12 text-h6 font-bold leading-6 text-primary border-1'
        onPress={() => router.push(ROUTER.LOGIN_FOR_TEST_URL)}
      >
        テストユーザーとしてログイン
      </Button>
      <p className='text-[0.75rem] leading-[1.313rem] mt-6'>
        サービスのフル機能を使い場合には法人アカウントの登録が必要です。法人アカウント登録後にユーザーアカウントを管理者が発行します。
      </p>
      <Button
        fullWidth
        color='primary'
        variant='bordered'
        className='mt-6 h-12 text-h6 font-bold leading-6 text-primary border-1'
      >
        法人アカウントを作る
      </Button>
    </div>
  );
}

export default DoesNotHaveAccount;
