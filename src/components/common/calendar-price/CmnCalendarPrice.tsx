import { Button, Checkbox, Chip, Skeleton } from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';

import { DATE_FORMAT } from '@/constants/constants';
import { NextIcon } from '@/icons/NextIcon';
import { PreviousIcon } from '@/icons/PreviousIcon';
import dayjs from '@/lib/dayjs';
import { WEEKDAYS_START_MONDAY } from '@/lib/dayOfWeek';
import { handleFormatNumberInput } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { priceService } from '@/services/transaction/price';
import { ICalendarPrice, IDataCalender, ISelectedDay } from '@/types/app';

import CmnDatePicker from '../CmnDatePicker';
import CmnInputNumber from '../CmnInputNumber';

interface CmnCalendarPriceProps {
  data: ICalendarPrice[];
  availableDays?: string[];
  modeView?: boolean;
  handleApplyPrice?: (price: number, day: string) => void;
  handleApplyAllPrice?: (price: number) => void;
}

export default function CmnCalendarPrice({
  data,
  availableDays,
  modeView = false,
  handleApplyPrice,
  handleApplyAllPrice,
}: CmnCalendarPriceProps) {
  const priceApi = priceService();

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [dataMarketPrice, setDataMarketPrice] = useState<IDataCalender[]>([]);
  const [isSelectedAll, setIsSelectedAll] = useState(false);

  const [price, setPrice] = useState<number>();
  const [priceAll, setPriceAll] = useState<number>();
  const [daySelected, setDaySelected] = useState<string>();

  useEffect(() => {
    if (data.length > 0) fetchDataCalendarPrice();
  }, [selectedMonth]);

  useEffect(() => {
    if (availableDays && availableDays.length > 0) {
      //calculate of selectedMonth by list availableDays
      const startDate = dayjs(availableDays[0], DATE_FORMAT.YYYYMMDD);
      setSelectedMonth(startDate.toDate());
    }
  }, [availableDays]);

  useEffect(() => {
    setDataMarketPrice([]);
    if (!(modeView && data.length == 0)) {
      fetchDataCalendarPrice();
    }
  }, [modeView, data]);

  const fetchDataCalendarPrice = async () => {
    setLoading(true);
    setDataMarketPrice([]);
    try {
      const date = `${selectedMonth.getFullYear()}${(selectedMonth.getMonth() + 1).toString().padStart(2, '0')}`;
      const result = await priceApi.shipperMarket(date);
      setDataMarketPrice(result.data);
    } catch (error) {
      console.error('Error fetching data calendar price:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNext = () => {
    setSelectedMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const adjustedFirstDay = (firstDay + 6) % 7; // Adjust to make Monday the first day (0 = Monday, ..., 6 = Sunday)

    return Array.from({ length: 42 }, (_, i) => {
      const day = i - adjustedFirstDay + 1; // Adjusted calculation for days
      if (day > 0 && day <= daysInMonth) {
        return { day, month: month + 1, year, isCurrentMonth: true };
      } else if (day <= 0) {
        const prevMonthDays = new Date(year, month, 0).getDate();
        return {
          day: prevMonthDays + day,
          month: month === 0 ? 12 : month,
          year: month === 0 ? year - 1 : year,
          isCurrentMonth: false,
        };
      } else {
        return {
          day: day - daysInMonth,
          month: month + 2 > 12 ? 1 : month + 2,
          year: month + 2 > 12 ? year + 1 : year,
        };
      }
    });
  }, [year, month]);

  const handleDayClick = (dayInfo: ISelectedDay) => {
    const dateString = `${dayInfo.year}${dayInfo.month.toString().padStart(2, '0')}${dayInfo.day.toString().padStart(2, '0')}`;
    if (daySelected === dateString) {
      setDaySelected(undefined);
    } else {
      setDaySelected(dateString);
    }
  };

  const ChipDayWeek = () => {
    return (
      <Chip
        color='success'
        size='sm'
        radius='sm'
        classNames={{
          base: 'h-5 p-0 rounded',
          content: 'text-xs text-[#E8F1FE]',
        }}
      >
        日別
      </Chip>
    );
  };

  const ChipMarket = () => {
    return (
      <Chip
        color='primary'
        size='sm'
        radius='sm'
        classNames={{
          base: 'h-5 p-0 rounded',
          content: 'text-xs text-[#E8F1FE]',
        }}
      >
        平均
      </Chip>
    );
  };

  return (
    <div className='w-full bg-white border border-primary rounded-lg p-3'>
      <div className='flex items-center px-8 py-2 space-x-4'>
        <div className=''>
          <div className='text-3xl'>{`${month + 1}月`}</div>
          <div className='text-base text-[#757575]'>{`${year}`}</div>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='flex items-center space-x-1'>
            <ChipDayWeek />
            <span className='text-xs'>車両別の日別運賃</span>
          </div>
          <div className='flex items-center space-x-1'>
            <ChipMarket />
            <span className='text-xs'>車両別の平均運賃</span>
          </div>
        </div>
      </div>
      {!modeView && (
        <>
          <div className='mt-3 border border-[#555555] rounded-lg p-2 space-y-2'>
            <div className='text-base font-bold'>一律運賃設定</div>
            <div className='flex items-center space-x-2'>
              <div className='text-base font-bold'>金額入力</div>
              <CmnInputNumber
                name='price'
                isPrice
                valueDefault={priceAll}
                classNameWrap='w-44'
                size='md'
                onValueChange={(value: string) => setPriceAll(Number(value) ? Number(value) : undefined)}
              />
              <Button
                className='text-base font-bold'
                size='md'
                radius='sm'
                color='primary'
                isDisabled={!priceAll}
                onPress={() => {
                  if (handleApplyAllPrice && priceAll) {
                    handleApplyAllPrice(priceAll);
                  }
                  setPriceAll(undefined);
                }}
              >
                金額を適用
              </Button>
            </div>
          </div>
          <div className='mt-3 border border-[#555555] rounded-lg p-2 space-y-2'>
            <div className='text-base font-bold'>日別運賃設定</div>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <div className='text-base font-bold'>日付指定</div>
                <CmnDatePicker
                  size='md'
                  variant='bordered'
                  radius='sm'
                  className='w-[12.125rem]'
                  classNameWrap='w-[12.125rem] min-w-[12.125rem]'
                  date={daySelected}
                  formatDate={DATE_FORMAT.YYYYMMDD}
                  onChangeValue={(value: string) => {
                    let date = dayjs(value, DATE_FORMAT.DEFAULT).format(DATE_FORMAT.YYYYMMDD);
                    setDaySelected(date);
                  }}
                />
              </div>
              <div className='flex items-center space-x-2'>
                <div className='text-base font-bold'>金額入力</div>
                <CmnInputNumber
                  name='price'
                  isPrice
                  valueDefault={price}
                  classNameWrap='w-44'
                  size='md'
                  onValueChange={(value: string) => setPrice(Number(value) ? Number(value) : undefined)}
                />
                <Button
                  className='text-base font-bold'
                  size='md'
                  radius='sm'
                  color='primary'
                  isDisabled={!price || !daySelected}
                  onPress={() => {
                    if (handleApplyPrice && price && daySelected) {
                      handleApplyPrice(price, daySelected);
                    }
                    setPrice(undefined);
                    setDaySelected(undefined);
                  }}
                >
                  金額を適用
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className='mt-4 flex items-center justify-between'>
        <div className='flex items-center mb-2'>
          <Button isIconOnly aria-label='previous-button' variant='light' size='sm' onPress={handlePrev}>
            <PreviousIcon className='w-5 h-5' fill='#0017C1' />
          </Button>
          <span className='font-bold text-[1.375rem] mx-2'>{`${year}年${month + 1}月`}</span>
          <Button isIconOnly aria-label='next-button' variant='light' size='sm' onPress={handleNext}>
            <NextIcon className='w-5 h-5' fill='#0017C1' />
          </Button>
        </div>
        <div className='flex items-center'>
          <Checkbox
            size='sm'
            radius='none'
            classNames={{
              wrapper: 'h-4 w-4 before:border before:border-[#1E1E1E]',
              label: 'text-sm text-[#1E1E1E]',
            }}
            isSelected={isSelectedAll}
            isDisabled={modeView}
            onValueChange={() => setIsSelectedAll(!isSelectedAll)}
          >
            全選択
          </Checkbox>
        </div>
      </div>
      <div className='w-full overflow-x-auto'>
        <div className='min-w-[55rem] space-y-1'>
          <div>
            <div className='grid grid-cols-7 space-x-1'>
              {WEEKDAYS_START_MONDAY.map((day) => (
                <div
                  key={day}
                  className='bg-background text-[.625rem] text-[#757575] w-[7.5rem] h-[1.4375rem] flex items-center justify-center'
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
          <div className='space-y-1'>
            {Array.from({ length: 6 }, (_, weekIndex) => (
              <div key={weekIndex} className='grid grid-cols-7 space-x-1'>
                {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((dayInfo, index) => {
                  const dateString = `${dayInfo.year}${dayInfo.month.toString().padStart(2, '0')}${dayInfo.day.toString().padStart(2, '0')}`;
                  const isSelected = daySelected === dateString;
                  const isNotCurrentMonth = !dayInfo.isCurrentMonth;
                  const isAction = !modeView;
                  const isDisabled = dayInfo.isCurrentMonth && availableDays && !availableDays?.includes(dateString);
                  const priceData = data.find(
                    (item) =>
                      Number(item.day) === Number(dayInfo.day) &&
                      Number(item.month) === Number(dayInfo.month) &&
                      Number(item.year) === Number(dayInfo.year),
                  );
                  const marketPrice = dataMarketPrice.find((item) => {
                    const date = dayjs(item.month, DATE_FORMAT.YYYYMM);
                    const year = date.year();
                    const month = date.month() + 1;
                    const day = item.day;
                    return (
                      dayInfo.isCurrentMonth &&
                      Number(day) === dayInfo.day &&
                      month === dayInfo.month &&
                      year === dayInfo.year
                    );
                  });

                  return (
                    <div
                      key={index}
                      className={cn(
                        'h-full flex flex-col border border-[#E8F1FE] rounded-md min-h-[5.875rem] p-1',
                        isAction && 'cursor-pointer transition duration-300 ease-in-out hover:bg-background',
                        isSelected && 'border-2 border-[#264AF4]',
                        isDisabled && 'cursor-not-allowed opacity-30 hover:bg-white',
                        isNotCurrentMonth && 'border-none bg-[#F6F6F6] text-[#717579]',
                      )}
                      onClick={() => !modeView && !isDisabled && handleDayClick(dayInfo)}
                    >
                      <div className='text-end text-base font-bold text-[#757575]'>{dayInfo.day}</div>
                      <div className='mt-2 flex-1'>
                        {!isNotCurrentMonth && !isDisabled && (
                          <div className='h-full flex flex-col items-start justify-between'>
                            <div className='h-[1.75rem] flex items-center space-x-1'>
                              <ChipDayWeek />
                              <div className='text-base leading-3'>
                                {priceData && priceData.price
                                  ? `¥${handleFormatNumberInput(priceData.price.toString())}`
                                  : ''}
                              </div>
                            </div>
                            <div className='h-[1.75rem] flex items-center space-x-1'>
                              <ChipMarket />
                              {loading ? (
                                <Skeleton className='h-4 w-full rounded-sm' />
                              ) : (
                                <div className='text-base leading-3'>
                                  {marketPrice && marketPrice.high_price
                                    ? `¥${handleFormatNumberInput(marketPrice.high_price.toString())}`
                                    : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
