'use client';

import { Button, ScrollShadow } from '@nextui-org/react';
import Image from 'next/image';
import { FC, useEffect, useRef, useState } from 'react';

import CmnTextarea from '@/components/common/CmnTextarea';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { KEY_COOKIE_ROLE } from '@/constants/keyStorage';
import dayjs from '@/lib/dayjs';
import { getCookie } from '@/lib/utils';
import SocketService from '@/services/socket';
import { MESSAGE_TRANSACTIONS } from '@/types/carrier/transactionInfo';

interface ModalChatProps {
  data: any;
}

const ChatBlock: FC<ModalChatProps> = ({ data }) => {
  const [messages, setMessages] = useState<MESSAGE_TRANSACTIONS[]>([]);
  const [textarea, setTextArea] = useState('');
  const [messageSent, setMessageSent] = useState<MESSAGE_TRANSACTIONS>({
    roomId: data?.id,
    company_name: data?.cnsg_prty_name_txt,
    from: '',
    message: '',
    time: '',
    date: '',
    role: '',
  });

  const socket = new SocketService();
  const scrollTarget = useRef<HTMLDivElement>(null);
  const userRole = getCookie(KEY_COOKIE_ROLE) as string | null;
  const messageLocalStorage = localStorage.getItem('messages');
  const messageLocalStorageJson = messageLocalStorage ? JSON.parse(messageLocalStorage) : {};

  const handleMessageRoom = (args: MESSAGE_TRANSACTIONS) => {
    setMessages((prevMessages) => [...prevMessages, args]);
  };

  useEffect(() => {
    if (!socket.socket.connected) {
      socket.connect();
    }
    socket.join(String(data?.id));
    socket.on('message_room', handleMessageRoom);

    return () => {
      // Cleanup the event listener on component unmount
      socket.off('message_room', handleMessageRoom);
    };
  }, []);

  // Load message from storage
  useEffect(() => {
    if (messageLocalStorageJson) {
      const messageHistoryFilter = messageLocalStorageJson[data?.id] || [];
      setMessages(messageHistoryFilter);
    }
  }, [data]);

  // Set message storage when message changed
  useEffect(() => {
    if (messages.length > 0) {
      messageLocalStorageJson[data?.id] = messages;
      localStorage.setItem('messages', JSON.stringify(messageLocalStorageJson));
    }
  }, [messages]);

  // Update the scroll target to the last message
  useEffect(() => {
    if (scrollTarget.current) {
      scrollTarget.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleChange = (value: string) => {
    setMessageSent((prev) => ({
      ...prev,
      message: value,
    }));
    setTextArea(value);
  };

  // Sent the message
  const handleMessage = () => {
    const response = {
      roomId: messageSent.roomId,
      company_name: messageSent.company_name || '',
      from: messageSent.from || '',
      message: messageSent.message,
      time: dayjs().format(TIME_FORMAT.DEFAULT),
      date: dayjs().format(DATE_FORMAT.DEFAULT),
      role: userRole,
    };

    socket.emit('message', response);
    if (data) {
      data.latest_message = response;
    }
    setTextArea('');
  };

  return (
    <>
      <h3 className='my-2'>取引メッセージ</h3>
      <div className='flex flex-col gap-3 py-2 w-full h-full bg-white border border-gray-border rounded-lg mb-3'>
        <div className='flex flex-col flex-grow font-normal text-sm gap-6'>
          <ScrollShadow hideScrollBar className='max-h-[400px]'>
            {messages.map((msg: MESSAGE_TRANSACTIONS, index) => {
              if (userRole === msg.role) {
                return (
                  <div
                    key={index}
                    className='place-self-end w-7/12 p-3'
                    ref={index === messages.length - 1 ? scrollTarget : null}
                  >
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
          <div className='flex flex-col px-4'>
            <CmnTextarea
              name='text'
              title='コメント'
              maxLength={1000}
              value={textarea}
              size='sm'
              onValueChange={(value) => handleChange(value)}
            />
            <div className='flex justify-end pr-1'>
              <Button
                radius='sm'
                className='text-base font-bold w-[8.5rem] h-12'
                color='primary'
                onPress={handleMessage}
              >
                メッセージ送信
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBlock;
