import { Button } from '@nextui-org/react';
import { memo, useState } from 'react';

import CmnInputSearch from '@/components/common/CmnInputSearch';
import { DATE_FORMAT } from '@/constants/constants';
import { useAppSelector } from '@/hook/useRedux';
import dayjs from '@/lib/dayjs';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { Option } from '@/types/app';

import CmnDropdown from './CmnDropdown';
import DialogMonthPicker from './dialog/DialogMonthPicker';
interface SearchSectionProps {
  searchName?: string;
  departureFrom?: number;
  arrivalTo?: number;
  startDate?: string;
  endDate?: string;
  className?: string;
  onChangeLocation: (departureFrom?: number, arrivalTo?: number) => void;
  onChangeDate: (startDate?: string, endDate?: string) => void;
  onSearch: (searchName?: string) => void;
}

export const SearchSection = memo(
  ({
    searchName,
    departureFrom,
    arrivalTo,
    startDate,
    endDate,
    className,
    onChangeLocation,
    onChangeDate,
    onSearch,
  }: SearchSectionProps) => {
    const [_searchName, _setSearchName] = useState<string | undefined>(searchName);
    const [_startDate, _setStartDate] = useState<string | undefined>(startDate);
    const [_endDate, _setEndDate] = useState<string | undefined>(endDate);
    const [_departureFrom, _setDepartureFrom] = useState<number | undefined>(departureFrom);
    const [_arrivalTo, _setArrivalTo] = useState<number | undefined>(arrivalTo);
    const regions = useAppSelector((state: RootState) => state.app.locations);

    const convertRegionsToListDropdown = (): Option[] => {
      const listDropdown: Option[] = [];
      regions.forEach((region) => {
        region.prefectures.forEach((prefecture) => {
          listDropdown.push({
            key: `${prefecture.id}`,
            label: `${prefecture.name} (${region.name})`,
          });
        });
      });

      return [{ key: '0', label: 'なし' }, ...listDropdown];
    };

    return (
      <section className={cn('flex flex-col gap-4', className)}>
        <div className='flex items-center gap-4'>
          <span>
            <b>期間設定</b>
          </span>
          <DialogMonthPicker
            initialStartDate={_startDate ? dayjs(_startDate, DATE_FORMAT.YYYYMMDD).toDate() : null}
            initialEndDate={_endDate ? dayjs(_endDate, DATE_FORMAT.YYYYMMDD).toDate() : null}
            onSelect={(start, end) => {
              _setStartDate(start ? dayjs(start).format(DATE_FORMAT.YYYYMMDD) : undefined);
              _setEndDate(end ? dayjs(end).format(DATE_FORMAT.YYYYMMDD) : undefined);
            }}
          />
          <Button size='md' radius='sm' color='primary' onPress={() => onChangeDate(_startDate, _endDate)}>
            この期間で絞り込む
          </Button>
        </div>
        <div className='flex items-center gap-4'>
          <span>
            <b>区間設定</b>
          </span>
          <div className='flex items-center space-x-2'>
            <b>出発地</b>
            <CmnDropdown
              classNameWrap='min-w-40 w-40'
              placeholder='出発地を選んでください'
              items={convertRegionsToListDropdown()}
              size='md'
              selectedKeys={_departureFrom ? [`${_departureFrom}`] : []}
              onChange={(e) => {
                let value = e.target.value ? Number(e.target.value) : undefined;
                if (value === 0) value = undefined;
                _setDepartureFrom(value);
              }}
            />
            <b>到着地</b>
            <CmnDropdown
              classNameWrap='min-w-40 w-40'
              placeholder='出発地を選んでください'
              items={convertRegionsToListDropdown()}
              size='md'
              selectedKeys={_arrivalTo ? [`${_arrivalTo}`] : []}
              onChange={(e) => {
                let value = e.target.value ? Number(e.target.value) : undefined;
                if (value === 0) value = undefined;
                _setArrivalTo(value);
              }}
            />
          </div>
          <Button size='md' radius='sm' color='primary' onPress={() => onChangeLocation(_departureFrom, _arrivalTo)}>
            この区間で絞り込む
          </Button>
        </div>
        <CmnInputSearch
          classNameWrap='w-[24.813rem]'
          value={_searchName}
          txtBtnSearch='絞り込む'
          onChange={(e) => _setSearchName(e.target.value)}
          onSearch={() => onSearch(_searchName)}
        />
      </section>
    );
  },
);
