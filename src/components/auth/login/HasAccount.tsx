'use client';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@nextui-org/react';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

import { account, mockAccount } from '@/constants/auth';
import {
  KEY_AUTHENTICATION_STORAGE,
  KEY_COOKIE_COMPANY_CODE,
  KEY_COOKIE_COMPANY_ID,
  KEY_COOKIE_DEBUG,
  KEY_COOKIE_REFRESH_TOKEN,
  KEY_COOKIE_ROLE,
  KEY_COOKIE_TOKEN,
  KEY_COOKIE_USER_ID,
  KEY_COOKIE_USER_ROLE,
} from '@/constants/keyStorage';
import { ROUTER } from '@/constants/router/router';
import { useAppDispatch } from '@/hook/useRedux';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { authenticationApi } from '@/services/authentication/authentication';
import { AuthLogin } from '@/types/auth';

import CmnInput from '../../common/CmnInput';

const schema = yup.object({
  operatorAccountId: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: 'ユーザーID' })),
  // .email(gTxt('VALIDATE.IN_VALID', { field: 'ユーザーID' })),
  accountPassword: yup.string().required(gTxt('VALIDATE.REQUIRED', { field: 'パスワード' })),
});

interface HasAccountProps {
  className?: string;
  setLoading: (loading: boolean) => void;
}

function HasAccount(props: HasAccountProps) {
  const { className, setLoading } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<AuthLogin>({
    resolver: yupResolver(schema),
    defaultValues: {
      operatorAccountId: '',
      accountPassword: '',
    },
  });

  const onSubmit = (data: AuthLogin) => {
    const userMockup = mockAccount.find(
      (account) => account.name === data.operatorAccountId && account.password === data.accountPassword,
    );
    if (userMockup) {
      setLoading(true);
      const accountLogin = account[userMockup.role as 'carrier' | 'shipper'];
      authenticationApi
        .login(accountLogin)
        .then((response) => {
          setCookie(KEY_AUTHENTICATION_STORAGE, true);
          setCookie(KEY_COOKIE_TOKEN, response.accessToken);
          setCookie(KEY_COOKIE_REFRESH_TOKEN, response.refreshToken);
          setCookie(KEY_COOKIE_ROLE, userMockup.role);
          setCookie(KEY_COOKIE_COMPANY_ID, userMockup.companyId);
          setCookie(KEY_COOKIE_COMPANY_CODE, userMockup.companyCode);
          setCookie(KEY_COOKIE_DEBUG, userMockup.debug);
          setCookie(KEY_COOKIE_USER_ID, userMockup.id);
          setCookie(KEY_COOKIE_USER_ROLE, userMockup.role);
          dispatch(actions.authAction.login(userMockup));
          setErrorMessage('');
          router.push(userMockup.role === 'carrier' ? ROUTER.CARRIER : ROUTER.SHIPPER);
        })
        .catch((error) => {
          console.log('error', error);
          setErrorMessage(gTxt('MESSAGES.LOGIN_ERROR'));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setErrorMessage(gTxt('MESSAGES.LOGIN_ERROR'));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('border border-primary rounded-lg p-4 pb-8 font-normal', className)}
    >
      <h3 className='leading-[2.625rem]'>アカウントを持っている</h3>
      <p className='text-[0.75rem] leading-[1.313rem] mt-4'>登録しているアカウントでサービスにログインします。</p>
      {errorMessage && <p className='text-red-500 text-xs mt-4'>{errorMessage}</p>}
      <CmnInput
        required
        txtRequired={gTxt('COMMON.LABEL_REQUIRED')}
        title='ユーザーID'
        classNameWrap='mt-4'
        helpText='登録時のユーザーIDを入力'
        errorMessage={errors.operatorAccountId?.message}
        register={register}
        name='operatorAccountId'
      />
      <CmnInput
        required
        txtRequired={gTxt('COMMON.LABEL_REQUIRED')}
        type='password'
        title='パスワード'
        classNameWrap='mt-4'
        helpText='登録時のパスワードを入力'
        isInvalid={Boolean(errors.accountPassword)}
        errorMessage={errors.accountPassword?.message}
        register={register}
        name='accountPassword'
      />
      <p className='text-[0.75rem] text-error leading-[1.313rem] underline mt-4 cursor-pointer'>ログインできない場合</p>
      <Button
        fullWidth
        type='submit'
        color='primary'
        isDisabled={!isValid}
        className={cn('mt-4 h-12 text-h6 font-bold leading-6 text-white', !isValid && 'bg-[#F5F5F5] text-[#B3B3B3]')}
      >
        ログインする
      </Button>
    </form>
  );
}

export default HasAccount;
