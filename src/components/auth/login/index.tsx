'use client';

import { useState } from 'react';

import Loading from '@/components/common/Loading';

import DoesNotHaveAccount from './DoesNotHaveAccount';
import HasAccount from './HasAccount';

function Login() {
  const [loading, setLoading] = useState(false);
  return (
    <div className='flex items-center justify-center mt-10'>
      {loading && <Loading />}
      <HasAccount className='mr-4 w-[24rem]' setLoading={setLoading} />
      <DoesNotHaveAccount className='ml-4 w-[24rem]' />
    </div>
  );
}

export default Login;
