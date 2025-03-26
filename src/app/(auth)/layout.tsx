import React from 'react';

import HeaderAuth from '@/components/auth/Header';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-white min-h-screen'>
      <div className='max-w-screen-xl min-w-96 flex-col mx-auto py-10 px-8'>
        <HeaderAuth />
        {children}
      </div>
    </div>
  );
}
