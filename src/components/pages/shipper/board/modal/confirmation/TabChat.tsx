'use client';

import { ScrollShadow } from '@nextui-org/react';
import Image from 'next/image';
import React, { FC, useState } from 'react';

import CmnTextarea from '@/components/common/CmnTextarea';
import { DATE_FORMAT } from '@/constants/constants';
import { KEY_COOKIE_ROLE } from '@/constants/keyStorage';
import dayjs from '@/lib/dayjs';
import { getCookie } from '@/lib/utils';
import { MESSAGE_TRANSACTIONS } from '@/types/carrier/transactionInfo';

interface TabChatProps {
  data: any;
}

const TabChat: FC<TabChatProps> = ({ data }) => {
  const [messages, setMessages] = useState<MESSAGE_TRANSACTIONS[]>([]);
  const userRole = getCookie(KEY_COOKIE_ROLE) as string | null;
  return (
    <>
      <h3>取引メッセージ</h3>
      <div className='flex flex-col flex-grow font-normal text-sm gap-6 rounded-lg border border-default p-8 mt-8'>
        <ScrollShadow hideScrollBar className='max-h-[400px]'>
          {messages.map((msg: MESSAGE_TRANSACTIONS, index) => {
            if (userRole === msg.role) {
              return (
                <div key={index} className='place-self-end w-7/12 p-3' ref={null}>
                  <div className='flex flex-col pb-2'>
                    <p className='h-6'>既読</p>
                    <p className='h-6'>
                      {dayjs(msg.date).format(DATE_FORMAT.JAPANESE)} {msg.time}
                    </p>
                  </div>
                  <div className='border border-gray-200 p-3'>
                    <p>{msg.message}</p>
                  </div>
                </div>
              );
            }
            return (
              <div key={index} className='col-start-1 col-end-8 p-3 rounded-lg'>
                <div className='flex flex-row items-start'>
                  <div className='flex items-center justify-center flex-shrink-0'>
                    <Image
                      className='!relative border border-[#D9D9D9]'
                      src='https://s3-alpha-sig.figma.com/img/4d10/f6ca/6b09919df8cda05ef9bad8cca1be6eb9?Expires=1737331200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=je5G4pyLcyjNut6IImqTWoFo4KsOoKOu-ggJxVP7K02oS73tuCNNMhCIctSg-Ql2B4ymra8RX561Yh-4aHFay0TUn-AXSOCzDDo6xoPdvwwxe43bjpwesKm2bcpd38hbxH-MYywzvFp3Ho7bqbDsvUfzvNoGMsUEtTgV5OBog43Rpz-VJzVGLsbBPTbyc9M7~kvxH~Mxsq8RqU2OGMKOVPbLYxvHOL~9CPkOquulu7AMwAKQ1HrY1SM2IY-bgmqSgPGeEguCbguBGuMlUDQnxNTRlu3NyZu1VXnHyWhYlhKsreWTZK9J1oCrVgE5RGkziEQ6p8xzkEPcY4o4uwcjfg__'
                      alt='Background image'
                      width={48}
                      height={48}
                      priority
                    />
                  </div>
                  <div className='relative pl-8 w-8/12'>
                    {msg.role === 'shipper' && (
                      <div className='flex flex-col pb-2'>
                        <p className='h-6'>東京第一営業部 荷主 太郎</p>
                        <p className='h-6'>株式会社シッパーA</p>
                      </div>
                    )}
                    <div className='flex flex-col pb-2'>
                      <p className='h-6'>既読</p>
                      <p className='h-6'>
                        {dayjs(msg.date).format(DATE_FORMAT.JAPANESE)} {msg.time}
                      </p>
                    </div>
                    <div className='flex flex-col border border-gray-200 p-3'>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollShadow>
        <div className='flex flex-col justify-end self-end grow-[2] w-full pt-1'>
          <div className='flex flex-col relative'>
            <CmnTextarea name='text' placeholder='送信するメッセージを入力してください' maxLength={1000} size='sm' />
            <p></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TabChat;
