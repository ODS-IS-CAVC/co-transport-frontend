'use client';
import { Button, Card, CardBody } from '@nextui-org/react';
import { useState } from 'react';

import { Icon } from '@/components/common/Icon';
import { SearchSection } from '@/components/common/SearchSection';
import { ROUTER_ID } from '@/constants/router/router';
import { gTxt } from '@/messages/gTxt';

const CarrierTransportSearch = () => {
  const [searchParams, setSearchParams] = useState<Record<string, any>>({
    searchName: '',
    departureFrom: '',
    arrivalTo: '',
    startDate: '',
    endDate: '',
  });
  return (
    <>
      <section className='bg-white p-4' id={ROUTER_ID.SHIPPER_CARRIER_TRANSPORT_SEARCH}>
        <div className='flex items-center flex-wrap'>
          <h3>{gTxt('MENU.SHIPPER.CARRIER_TRANSPORT_SEARCH')}</h3>
        </div>
        <p className='mt-2 text-xs'>キャリア側の輸送能力を検索できます</p>
        <div>
          <SearchSection
            searchName={searchParams.searchName}
            departureFrom={searchParams.departureFrom}
            arrivalTo={searchParams.arrivalTo}
            startDate={searchParams.startDate}
            endDate={searchParams.endDate}
            onChangeLocation={(departureFrom, arrivalTo) => {
              console.log('onChangeLocation', departureFrom, arrivalTo);
              setSearchParams({ ...searchParams, departureFrom, arrivalTo });
            }}
            onChangeDate={(startDate, endDate) => {
              console.log('onChangeDate', startDate, endDate);
              setSearchParams({ ...searchParams, startDate, endDate });
            }}
            onSearch={(searchName) => {
              console.log('onSearch', searchName);
              setSearchParams({ ...searchParams, searchName });
            }}
          />
        </div>
        <div className='mt-4 flex items-center justify-end'>
          <Button
            radius='sm'
            size='lg'
            variant='ghost'
            color='danger'
            className='text-base font-bold'
            onPress={() => {}}
          >
            絞り込み設定をリセット
          </Button>
        </div>
        <div className='mt-4 space-y-2'>
          {Array.from({ length: 10 }).map((_, index) => (
            <Card key={index} className='w-full border border-gray-border rounded-lg' shadow='none'>
              <CardBody className='flex flex-col items-start p-2'>
                <div className='w-full flex items-center justify-end'>
                  <b>登録日</b>
                  &#x3000;
                  <span className='text-sm'>2024年11月01日(金)</span>
                </div>
                <div className='mt-2 w-full flex flex-wrap items-center justify-start space-x-3'>
                  <span className='flex items-center'>
                    <b>運行日</b>
                    &#x3000;
                    <span className='text-2xl font-medium'>2024年11月01日</span>
                  </span>

                  <span className='flex items-center'>
                    <b>便名</b>
                    &#x3000;
                    <span className='text-2xl font-medium'>沼津DD1便</span>
                  </span>

                  <div className='flex items-center justify-center px-2 space-x-2 rounded-lg border border-[#D9D9D9]'>
                    <b>出発</b>
                    <span className='text-2xl font-medium'>駿河湾沼津 07:30発</span>
                    <Icon icon='keyboard_arrow_right' size={24} />
                    <b>到着</b>
                    <span className='text-2xl font-medium'>浜松 08:59着</span>
                  </div>
                  <span className='flex items-center'>
                    <b>運賃</b>
                    &#x3000;
                    <span className='text-2xl font-medium'>¥ 55,000</span>
                  </span>
                  <span className='flex items-center'>
                    <b>運送会社</b>
                    &#x3000;
                    <span className='text-2xl font-medium'>株式会社キャリアD</span>
                  </span>
                </div>
                <div className='mt-2 flex items-center justify-start px-2 space-x-2 rounded-lg border border-[#D9D9D9]'>
                  <b>車両</b>
                  <span className='text-2xl font-medium'>極東開発</span>
                  <b>タイプ</b>
                  <span className='text-2xl font-medium'>トレーラ</span>
                  <b>温度帯</b>
                  <span className='text-2xl font-medium'>ドライ</span>
                  <b>車両ナンバー</b>
                  <span className='text-2xl font-medium'>{'沼津 100 あ　44-55'}</span>
                </div>
                <div className='mt-2 w-full flex items-center justify-end gap-4'>
                  <Button size='lg' radius='sm' color='primary' onPress={() => {}} className='text-base font-bold'>
                    運送会社情報を見る
                  </Button>
                  <Button size='lg' radius='sm' color='primary' onPress={() => {}} className='text-base font-bold'>
                    予約可能な運行を見る
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
};

export default CarrierTransportSearch;
