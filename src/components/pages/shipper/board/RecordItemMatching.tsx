'use client';

import { Button, Card, CardBody, CardHeader } from '@nextui-org/react';
import dayjs from 'dayjs';

import { Icon } from '@/components/common/Icon';
import { DATE_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { ITransportMatching } from '@/types/shipper/transport';

interface RecordItemMatchingProps {
  dataItem?: ITransportMatching;
  checkDetailMatching: (id: number) => void;
}

const RecordItemMatching = ({ dataItem, checkDetailMatching }: RecordItemMatchingProps) => {
  if (!dataItem) return;
  const regions = useAppSelector((state: RootState) => state.app.locations);
  return (
    <Card className={`w-full rounded-lg border border-gray-border mb-2 flex-shrink-0`} shadow='none'>
      <CardHeader className={`flex items-center text-sm pb-0 p-2 gap-2`}>
        <h4 className='flex gap-2 font-medium mr-auto'>
          <span>便名</span>
          <span>{dataItem.propose_snapshot.trip_name}</span>
        </h4>
        <h4 className='flex gap-2'>
          <span className='font-medium'>登録日</span>
          <span className='font-normal'>
            {dataItem.created_date && dayjs(dataItem.created_date).format(DATE_FORMAT.JAPANESE_DATE)}
          </span>
        </h4>
        <h4 className='flex gap-2'>
          <span className='font-medium'>運送日</span>
          <span className='font-normal'>
            {(dataItem?.transport_date && dayjs(dataItem.transport_date).format(DATE_FORMAT.JAPANESE_DATE)) || ''}
          </span>
        </h4>
      </CardHeader>
      <CardBody className='p-2'>
        <div className='flex items-center gap-4 flex-wrap'>
          <div className='flex font-bold items-center border border-default rounded-lg py-1 px-3 gap-6 flex-nowrap'>
            <div className='flex gap-2 items-center flex-wrap'>
              <p className='text-base'>出発</p>
              <h4>{getPrefectureName(regions, dataItem.propose_snapshot.departure_from)}</h4>
              <h4>{dataItem.trailer.service_strt_time && formatTime(dataItem.trailer.service_strt_time)}発</h4>
            </div>
            <Icon icon='keyboard_arrow_right' size={24} />
            <div className='flex gap-2 items-center flex-wrap'>
              <p className='text-base'>到着</p>
              <h4>{getPrefectureName(regions, dataItem.propose_snapshot.arrival_to)}</h4>
              <h4>{dataItem.propose_snapshot.arrival_time && formatTime(dataItem.propose_snapshot.arrival_time)}着</h4>
            </div>
          </div>
          <div className='font-bold flex gap-2 items-center min-w-[16.25rem]'>
            <p className='text-base'>運賃</p>
            <h4>
              {currencyFormatWithIcon(dataItem.propose_snapshot.price + (dataItem.propose_snapshot.cut_off_fee || 0))}
            </h4>
          </div>
          <div className='font-bold flex gap-2 items-center whitespace-nowrap'>
            <p className='text-base'>カットオフ時間</p>
            <h4>
              {(dataItem.propose_snapshot.departure_time_min &&
                formatTime(dataItem.propose_snapshot.departure_time_min)) ||
                '__'}
              -{(dataItem.trailer.service_strt_time && formatTime(dataItem.trailer.service_strt_time)) || '__'}
            </h4>
          </div>
        </div>

        <div className='flex justify-between items-center mt-4'>
          <div className='flex gap-2'>
            <p className='text-base font-bold'>トレーラ</p>
            <div className='rounded-lg border border-default px-[10px] py-[6px] text-base'>
              <p>{dataItem.trailer.trailer_license_plt_num_id}</p>
              <p>
                {dataItem.propose_snapshot?.vehicle_name}
                {dataItem.propose_snapshot?.temperature_range &&
                  getCondition(dataItem.propose_snapshot?.temperature_range)}
              </p>
            </div>
          </div>
          <Button
            className='text-neutral w-[7.1875rem] font-bold h-12 text-base self-end'
            size='sm'
            color='primary'
            radius='sm'
            onPress={() => dataItem && checkDetailMatching(dataItem.id)}
          >
            詳細を見る
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default RecordItemMatching;
