'use client';
import { Button } from '@nextui-org/react';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Loading from '@/components/common/Loading';
import { account, carrierAccounts, mockAccount, shipperAccounts } from '@/constants/auth';
import {
  KEY_AUTHENTICATION_STORAGE,
  KEY_COOKIE_COMPANY_ID,
  KEY_COOKIE_REFRESH_TOKEN,
  KEY_COOKIE_ROLE,
  KEY_COOKIE_TOKEN,
  KEY_COOKIE_USER_ID,
} from '@/constants/keyStorage';
import { ROUTER } from '@/constants/router/router';
import { useAppDispatch } from '@/hook/useRedux';
import { actions } from '@/redux';
import { authenticationApi } from '@/services/authentication/authentication';

function LoginForTesting() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const TYPE = {
    CARRIER: 'carrier',
    SHIPPER: 'shipper',
  };

  const [loading, setLoading] = useState(false);

  const login = (type: string) => () => {
    const data = {
      operatorAccountId: type === TYPE.SHIPPER ? shipperAccounts[0].name : carrierAccounts[0].name,
      accountPassword: type === TYPE.SHIPPER ? shipperAccounts[0].password : carrierAccounts[0].password,
    };
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
          setCookie(KEY_COOKIE_USER_ID, userMockup.id);
          dispatch(actions.authAction.login(userMockup));
          router.push(userMockup.role === 'carrier' ? ROUTER.CARRIER : ROUTER.SHIPPER);
        })
        .catch((error) => {
          console.log('error', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <div>
      {loading && <Loading />}
      <div className='flex items-center justify-center mt-10'>
        <div className='border border-primary rounded-lg p-4 text-[#000000] font-normal w-[24rem]'>
          <h3 className='leading-[2.625rem]'>テストユーザーでログイン</h3>
          <p className='text-[0.75rem] leading-[1.313rem] mt-10'>
            テストユーザーとしてログインする場合、キャリア（運送業者）側とシッパー（荷主）側のどちらの立場でログインするか選択してください。
          </p>
          <Button
            fullWidth
            color='primary'
            variant='bordered'
            onPress={login(TYPE.CARRIER)}
            className='mt-4 h-12 text-h6 font-bold leading-6 text-primary border-1'
          >
            キャリアとしてログイン
          </Button>

          <Button
            fullWidth
            color='primary'
            variant='bordered'
            onPress={login(TYPE.SHIPPER)}
            className='mt-8 h-12 text-h6 font-bold leading-6 text-primary border-1'
          >
            シッパーとしてログイン
          </Button>
          <Button
            fullWidth
            color='primary'
            onPress={() => router.back()}
            className='mt-8 h-12 text-h6 font-bold leading-6 text-primary bg-[#E8F1FE]'
          >
            戻る
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LoginForTesting;
