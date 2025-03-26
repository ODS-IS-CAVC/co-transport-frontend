'use client';

import dayjs from 'dayjs';
import { FC } from 'react';

import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import { OUT_PACKAGES } from '@/constants/shipper';
import { useAppSelector } from '@/hook/useRedux';
import { getCondition } from '@/lib/carrier';
import { getPrefectureName } from '@/lib/prefectures';
import { currencyFormatWithIcon, formatTime } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { IDetailTransaction } from '@/types/carrier/transactionInfo';

import Item from '../../Item';

interface DetailInformationTabProps {
  data?: IDetailTransaction;
}

const DetailInformationTab: FC<DetailInformationTabProps> = ({ data }) => {
  if (!data) return;
  const regions = useAppSelector((state: RootState) => state.app.locations);

  return (
    <>
      <Item dataItem={data} isDetailTab />
      <div className='flex text-foreground font-normal mt-8 gap-8 flex-wrap'>
        <div className='col-span-1 flex flex-col gap-4'>
          <h3>輸送計画</h3>
          <p>
            <span className='font-bold'>輸送計画ID</span> &nbsp;
            <span>{data?.request_snapshot?.transport_code}</span>
          </p>
          <p>
            <span className='font-bold'>運賃</span> &nbsp;
            <span>
              {data.request_snapshot?.price_per_unit && currencyFormatWithIcon(data.request_snapshot?.price_per_unit)}
            </span>
          </p>
          <p>
            <span className='font-bold'>トレーラ数</span> &nbsp;
            <span>{data.trailer_number}</span>
          </p>
        </div>
        <div className='col-span-1 flex flex-col gap-4'>
          <h3>荷物詳細</h3>
          <p>
            <span className='font-bold'>品名</span> &nbsp;
            <span>{data.request_snapshot.transport_name}</span>
          </p>
          <p>
            <span className='font-bold'>品目</span> &nbsp;
            <span>
              {data.request_snapshot?.outer_package_code &&
                OUT_PACKAGES.find((op) => op.key === data.request_snapshot.outer_package_code.toString())?.label}
            </span>
          </p>
          <p>
            <span className='font-bold'>荷物ID</span> &nbsp;
            <span>{data.shipper_operator_code}</span>
          </p>
          <p>
            <span className='font-bold'>全長</span> &nbsp;
            <span>{data.request_snapshot?.total_length}cm</span>
          </p>
          <p>
            <span className='font-bold'>全幅</span> &nbsp;
            <span>{data.request_snapshot?.total_width}cm</span>
          </p>
          <p>
            <span className='font-bold'>全高</span> &nbsp;
            <span>{data.request_snapshot?.total_height}cm</span>
          </p>
          <p>
            <span className='font-bold'>重量</span> &nbsp;
            <span>{data.request_snapshot?.weight || 0}t</span>
          </p>
          <p>
            <span className='font-bold'>温度帯</span> &nbsp;
            <span>
              {data.request_snapshot?.temperature_range && getCondition(data.request_snapshot.temperature_range)}
            </span>
          </p>
          <p>
            <span className='font-bold'>備考</span> &nbsp;
            <span>{data.request_snapshot?.special_instructions}</span>
          </p>
        </div>
        <div className='col-span-1 flex flex-col gap-4'>
          <h3>区間情報</h3>
          <p>
            <span className='font-bold'>出発地</span> &nbsp;
            <span>{data.departure_from && getPrefectureName(regions, data.departure_from)}</span>
          </p>
          <p>
            <span className='font-bold'>経由地</span> &nbsp;
            <span></span>
            {/* TODO */}
          </p>
          <p>
            <span className='font-bold'>到着地</span> &nbsp;
            <span>{data.arrival_to && getPrefectureName(regions, data.arrival_to)}</span>
          </p>
          <h3>日時情報</h3>
          <p>
            <span className='font-bold'>輸送日時</span> &nbsp;
            <span> {data.propose_snapshot?.day && dayjs(data.propose_snapshot.day).format(DATE_FORMAT.DEFAULT)}</span>
          </p>
          <p>
            <span className='font-bold'>基本持込期限(カットオフ)</span> &nbsp;
            <span>
              {data.propose_snapshot?.departure_time_max &&
                dayjs(data.propose_snapshot.departure_time_max, TIME_FORMAT.HH_MM)
                  .subtract(data.propose_snapshot?.cut_off_time || 0, 'hour')
                  .format(TIME_FORMAT.HH_MM)}
              {'~'}
              {data.propose_snapshot?.arrival_time &&
                dayjs(data.propose_snapshot.arrival_time, TIME_FORMAT.HH_MM)
                  .subtract(data.propose_snapshot?.cut_off_time || 0, 'hour')
                  .format(TIME_FORMAT.HH_MM)}
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default DetailInformationTab;
