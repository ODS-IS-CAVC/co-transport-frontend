import { Button, Chip, Skeleton } from '@nextui-org/react';
import { useSearchParams } from 'next/navigation';
import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { currencyFormatWithIcon } from '@/lib/utils';
import { IDataCalender } from '@/types/app';

import { Icon } from './Icon';

interface CmnCalendarProps {
  data: IDataCalender[];
  setMonthCalendar?: (month: string) => void;
  viewList: ReactNode;
  viewMode: number;
  isLoading?: boolean;
}

export default function CmnCalendar({ data, setMonthCalendar, viewList, viewMode, isLoading }: CmnCalendarProps) {
  const searchParams = useSearchParams();

  const [selectedMonth, setSelectedMonth] = useState(
    searchParams?.get('start_date') ? new Date(searchParams?.get('start_date')!) : new Date(),
  );
  const startDate = searchParams?.get('start_date') ? new Date(searchParams.get('start_date')!) : '';
  const endDate = searchParams?.get('end_date') ? new Date(searchParams?.get('end_date')!) : '';
  const startMonthFilter = startDate
    ? `${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}`
    : '';
  const endMonthFilter = endDate
    ? `${endDate.getFullYear()}${(endDate.getMonth() + 1).toString().padStart(2, '0')}`
    : '';

  const [viewModeWithWidth, setViewModeWithWidth] = useState<number>(1);
  const [changedMonth, setChangedMonth] = useState<string>('');

  // check view model with width > 880px
  const widthCalenderRef = useRef<HTMLDivElement>(null);
  const updateWidth = () => {
    if (!widthCalenderRef.current) return;
    setViewModeWithWidth(widthCalenderRef.current.offsetWidth >= 880 ? 1 : 2);
  };

  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);
  // end check view model

  const generateMonthList = (currentMonth: Date) => {
    const startMonth = new Date(currentMonth);
    startMonth.setMonth(currentMonth.getMonth() - 2);

    const months = Array.from({ length: 5 }, (_, i) => {
      const tempDate = new Date(startMonth);
      tempDate.setMonth(startMonth.getMonth() + i, 1);
      return {
        year: tempDate.getFullYear(),
        month: tempDate.getMonth() + 1,
      };
    });
    return months;
  };

  const handleMonthClick = (year: number, month: number) => {
    const newDate = new Date(year, month - 1);
    setSelectedMonth(newDate);
    setChangedMonth(`${newDate.getFullYear()}${(newDate.getMonth() + 1).toString().padStart(2, '0')}`);
  };

  const monthList = generateMonthList(selectedMonth);

  const handlePrev = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      const shouldUpdate = !startDate || newDate >= startDate; // Check if startDate is not set, or if the new date is greater than or equal to the startDate
      const prevMonth = shouldUpdate ? newDate : prev; // Decide whether to update the month or keep the previous month
      setChangedMonth(`${prevMonth.getFullYear()}${(prevMonth.getMonth() + 1).toString().padStart(2, '0')}`);
      return prevMonth;
    });
  };

  const handleNext = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      const shouldUpdate = !endDate || newDate <= endDate; // Check if endDate is not set, or if the new date is less than or equal to endDate
      const nextMonth = shouldUpdate ? newDate : prev; // Decide whether to update the month or keep the previous month
      setChangedMonth(`${nextMonth.getFullYear()}${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`);
      return nextMonth;
    });
  };

  const yearSelected = selectedMonth.getFullYear();
  const monthSelected = (selectedMonth.getMonth() + 1).toString().padStart(2, '0');

  useEffect(() => {
    if (!changedMonth) return;
    setMonthCalendar && setMonthCalendar(changedMonth);
  }, [changedMonth]);

  const calendarTable = () => {
    const dataTemp: IDataCalender[] = [...(data || [])];

    // Get the number of days in the selected month
    const daysInMonth = new Date(yearSelected, Number(monthSelected), 0).getDate();

    for (let i = 1; i <= 35; i++) {
      let currentMonth = `${yearSelected}${monthSelected}`;
      let day = i;

      // Handle overflow to the next month
      if (i > daysInMonth) {
        const nextMonth = Number(monthSelected) === 12 ? 1 : Number(monthSelected) + 1;
        const nextYear = Number(monthSelected) === 12 ? yearSelected + 1 : yearSelected;

        currentMonth = `${nextYear}${nextMonth.toString().padStart(2, '0')}`;
        day = i - daysInMonth;
      }

      const dayString = day.toString().padStart(2, '0');

      const isDayExist = data && data.some((item) => item.day === dayString && item.month === currentMonth);

      if (!isDayExist) {
        dataTemp.push({
          month: currentMonth,
          day: dayString,
          low_price: -1,
          high_price: -1,
          total_trans_number: -1,
        });
      }
    }

    // Sort the dataTemp array by month and day
    dataTemp.sort((a, b) => {
      if (a.month === b.month) {
        return parseInt(a.day) - parseInt(b.day);
      }
      return parseInt(a.month) - parseInt(b.month);
    });

    return Array.from({ length: 5 }).map((_, rowIndex) => {
      return (
        <tr key={rowIndex}>
          {dataTemp.slice(rowIndex * 7, rowIndex * 7 + 7).map(
            (
              day: {
                total_trans_number: number;
                day: string;
                month: string;
                low_price: number;
                high_price: number;
              },
              index: React.Key | null | undefined,
            ) => {
              return (
                <td
                  key={index}
                  className={`border border-background hover:!border-secondary hover:bg-background hover:shadow-[0_0_0_4px_#264af4] w-full] py-1 ${day.month !== `${yearSelected}${monthSelected}` ? 'opacity-50' : ''} `}
                >
                  <div className='flex flex-col justify-start h-[100%] px-1 gap-1'>
                    <div className='text-[#757575] text-end text-base font-bold leading-normal tracking-wide'>
                      {day.day}
                    </div>
                    <div className='flex items-center justify-between relative cursor-default'>
                      <Chip className='bg-secondary text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                        NS
                      </Chip>
                      <div className='text-black text-base font-normal leading-7 tracking-wide'>
                        {day.total_trans_number >= 0 ? day.total_trans_number : '￥_______'}
                      </div>
                    </div>
                    <div className='flex items-center justify-between relative cursor-default'>
                      <Chip className='bg-success text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                        FP
                      </Chip>{' '}
                      <div className='text-black text-base font-normal leading-7 tracking-wide'>
                        {day.low_price >= 0 ? currencyFormatWithIcon(day.low_price) : '￥_______'}
                      </div>
                    </div>
                    <div className='flex items-center justify-between relative cursor-default'>
                      <Chip className='bg-tertiary text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                        MP
                      </Chip>
                      <div className='text-black text-base font-normal leading-7 tracking-wide'>
                        {day.high_price >= 0 ? currencyFormatWithIcon(day.high_price) : '￥_______'}
                      </div>
                    </div>
                  </div>
                </td>
              );
            },
          )}
        </tr>
      );
    });
  };
  const calendarSkeleton = () => {
    return Array.from({ length: 5 }).map((_, rowIndex) => {
      return (
        <tr key={rowIndex}>
          {Array.from({ length: 35 })
            .slice(rowIndex * 7, rowIndex * 7 + 7)
            .map((_, index: React.Key | null | undefined) => {
              return (
                <td
                  key={index}
                  className={`border border-background hover:!border-secondary hover:bg-background hover:shadow-[0_0_0_4px_#264af4] w-full] py-1`}
                >
                  <div className='flex flex-col justify-start h-[100%] px-1 gap-1'>
                    <Skeleton className='w-8 h-6 self-end' />
                    <div className='flex items-center justify-between relative cursor-default'>
                      <Chip className='bg-secondary text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                        NS
                      </Chip>
                      <Skeleton className='w-20 h-7' />
                    </div>
                    <div className='flex items-center justify-between relative cursor-default'>
                      <Chip className='bg-success text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                        FP
                      </Chip>{' '}
                      <Skeleton className='w-20 h-7' />
                    </div>
                    <div className='flex items-center justify-between relative cursor-default'>
                      <Chip className='bg-tertiary text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                        MP
                      </Chip>
                      <Skeleton className='w-20 h-7' />
                    </div>
                  </div>
                </td>
              );
            })}
        </tr>
      );
    });
  };

  const viewCalendar = () => {
    return (
      <>
        <div className='w-full bg-white border border-primary rounded-lg p-3'>
          <div className='w-full px-8 flex justify-between items-center'>
            <div className='text-center font-normal tracking-wide'>
              <p className='text-black text-4xl  leading-[50.40px]'>{selectedMonth.getMonth() + 1}月</p>
              <p className='text-[#757575] text-base leading-7'>{selectedMonth.getFullYear()}</p>
            </div>
            <div className='flex gap-1 items-center'>
              <Chip className='bg-secondary text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                NS
              </Chip>
              <p className='text-center text-black text-xs font-normal leading-[21px] tracking-tight'>
                Number of Shipments 空いている便数
              </p>
            </div>
            <div className='flex gap-1 items-center'>
              <Chip className='bg-success text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                FP
              </Chip>

              <p className='text-center text-black text-xs font-normal leading-[21px] tracking-tight'>
                Floor Price 市場の最低価格
              </p>
            </div>
            <div className='flex gap-1 items-center'>
              <Chip className='bg-tertiary text-background h-[22px] rounded p-0 text-xs [&>span]:p-0 [&>span]:w-6 [&>span]:text-center'>
                MP
              </Chip>
              <p className='text-center text-black text-xs font-normal leading-[21px] tracking-tight'>
                Median Price 市場の中央価格
              </p>
            </div>
          </div>

          <table className='w-full mt-2 border-separate' style={{ borderSpacing: '4px' }}>
            <thead>
              <tr className='text-[#757575] text-[10px] font-normal leading-[15px] tracking-tight text-end bg-background'>
                <th className='p-1'>日</th>
                <th className='p-1'>月</th>
                <th className='p-1'>火</th>
                <th className='p-1'>水</th>
                <th className='p-1'>木</th>
                <th className='p-1'>金</th>
                <th className='p-1'>土</th>
              </tr>
            </thead>
            <tbody>{isLoading ? calendarSkeleton() : calendarTable()}</tbody>
          </table>
        </div>

        {/* pagination */}
        <div className='flex justify-between items-center w-full mt-2'>
          <Button
            isIconOnly
            aria-label='btn-first-page'
            className={`${startMonthFilter && `${yearSelected}${monthSelected}` !== startMonthFilter ? 'hover:!bg-secondary' : 'cursor-not-allowed'} rounded-md`}
            variant='light'
            onPress={() => (startDate ? setSelectedMonth(new Date(startDate)) : undefined)}
          >
            <Icon icon='first_page' className='hover:text-white p-2' size={24} />
          </Button>
          <Button
            className={`${startMonthFilter ? (`${yearSelected}${monthSelected}` !== startMonthFilter ? 'hover:!bg-secondary' : 'cursor-not-allowed') : 'hover:!bg-secondary'} rounded-md`}
            isIconOnly
            variant='light'
            onPress={handlePrev}
          >
            <Icon icon='keyboard_arrow_left' className='hover:text-white p-2' size={24} />
          </Button>
          {monthList.map(({ year, month }, index) => {
            const monthSelect = new Date(year, month - 1, 1);
            monthSelect.setMonth(monthSelect.getMonth() + 1);
            monthSelect.setDate(2);
            return (
              <div
                key={index}
                className={`px-4 py-2 rounded-lg text-xs font-medium leading-[18px] tracking-tight hover:bg-background
              ${startDate && monthSelect.getTime() < startDate.getTime() ? '!cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${endDate && new Date(year, month - 1, 1).getTime() > endDate.getTime() ? '!cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${
                selectedMonth.getFullYear() === year && selectedMonth.getMonth() + 1 === month
                  ? 'text-[#1e1e1e]'
                  : 'text-tertiary underline'
              }`}
                onClick={() => {
                  if (startDate && monthSelect.getTime() < new Date(startDate).setMonth(startDate.getMonth() + 1, 1))
                    return;
                  if (endDate && new Date(year, month - 1, 1).getTime() > endDate.getTime()) return;
                  handleMonthClick(year, month);
                }}
              >
                {year}年{month}月
              </div>
            );
          })}
          <Button
            isIconOnly
            className={`${endMonthFilter ? (`${yearSelected}${monthSelected}` !== endMonthFilter ? 'hover:!bg-secondary' : 'cursor-not-allowed') : 'hover:!bg-secondary'} rounded-md`}
            aria-label='btn-first-page'
            variant='light'
            onPress={handleNext}
          >
            <Icon icon='keyboard_arrow_right' className='hover:text-white p-2' size={24} />
          </Button>
          <Button
            isIconOnly
            className={`${endMonthFilter && `${yearSelected}${monthSelected}` !== endMonthFilter ? 'hover:!bg-secondary' : 'cursor-not-allowed'} rounded-md`}
            aria-label='btn-last-page'
            variant='light'
            onPress={() => (endDate ? setSelectedMonth(endDate) : undefined)}
          >
            <Icon icon='last_page' className='hover:text-white p-2' size={24} />
          </Button>
        </div>
      </>
    );
  };

  return <div ref={widthCalenderRef}>{viewModeWithWidth === 1 && viewMode === 1 ? viewCalendar() : viewList}</div>;
}
