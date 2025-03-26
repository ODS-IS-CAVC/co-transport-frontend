'use client';

import { Button } from '@nextui-org/react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/common/Icon';
import { WEEKDAYS } from '@/lib/dayOfWeek';
import { cn } from '@/lib/utils';

import { PaginationCalendar } from './PaginationCalendar';

dayjs.extend(isBetween);

const DAYS_OF_WEEK = 7;
const MAX_MONTHS_AHEAD = 11;

export interface DateRange {
  id?: number;
  vehicle_info_id?: number;
  start_date: Date;
  end_date: Date;
  status?: number;
  day_week?: number[];
}

export interface CurrentSelection {
  start_date: Date | null;
  end_date: Date | null;
}

interface CalendarVehicleProps {
  classNames?: string;
  initialDates?: DateRange[];
  onGetDataCalendar?: (tempDateRanges: DateRange[], currentSelection: CurrentSelection) => void;
}

function CalendarVehicle(props: CalendarVehicleProps) {
  const { classNames, initialDates = [], onGetDataCalendar = () => null } = props;
  const today = dayjs().startOf('day');
  const currentMonthStart = today.startOf('month');
  const maxSelectableDate = currentMonthStart.add(MAX_MONTHS_AHEAD, 'month').endOf('month');

  const [page, setPage] = useState<number>(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempDateRanges, setTempDateRanges] = useState<DateRange[]>([]);
  const [currentSelection, setCurrentSelection] = useState<CurrentSelection>({
    start_date: null,
    end_date: null,
  });

  useEffect(() => {
    if (initialDates?.length) {
      const convertedRanges = initialDates.map((date) => {
        return {
          ...date,
          start_date: dayjs(date.start_date, 'YYYYMMDD').toDate(),
          end_date: dayjs(date.end_date, 'YYYYMMDD').toDate(),
        };
      });
      setTempDateRanges(convertedRanges);
    } else {
      setTempDateRanges([]);
    }
  }, [initialDates?.length]);

  useEffect(() => {
    onGetDataCalendar(tempDateRanges, currentSelection);
  }, [tempDateRanges, currentSelection]);

  const isDateSelectable = (date: Date): boolean => {
    return (dayjs(date).isSame(today, 'day') || dayjs(date).isAfter(today)) && !dayjs(date).isAfter(maxSelectableDate);
  };

  const mergeOverlappingRanges = (ranges: DateRange[]): DateRange[] => {
    if (ranges.length <= 1) return ranges;
    const sortedRanges = [...ranges].sort((a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf());
    const mergedRanges: DateRange[] = [sortedRanges[0]];
    for (let i = 1; i < sortedRanges.length; i++) {
      const currentRange = sortedRanges[i];
      const lastMergedRange = mergedRanges[mergedRanges.length - 1];
      const nextDay = dayjs(lastMergedRange.end_date).add(1, 'day').toDate();
      if (dayjs(nextDay).isSame(currentRange.start_date, 'day')) {
        lastMergedRange.end_date = currentRange.end_date;
      } else {
        mergedRanges.push(currentRange);
      }
    }
    return mergedRanges;
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateSelectable(date)) return;
    if (!dayjs(date).isSame(dayjs(currentMonth), 'month')) {
      setCurrentMonth(dayjs(date).startOf('month').toDate());
      return;
    }
    const existingRangeIndex = tempDateRanges.findIndex((range) =>
      dayjs(date).isBetween(dayjs(range.start_date), dayjs(range.end_date), null, '[]'),
    );

    if (!currentSelection.start_date) {
      setCurrentSelection({
        start_date: date,
        end_date: null,
      });

      if (existingRangeIndex !== -1) {
        setTempDateRanges(tempDateRanges.filter((_, index) => index !== existingRangeIndex));

        dayjs(tempDateRanges[existingRangeIndex].start_date).isSame(
          dayjs(tempDateRanges[existingRangeIndex].end_date),
          'day',
        ) && setCurrentSelection({ start_date: null, end_date: null });
      }
    } else {
      const newStartDate = dayjs(date).isBefore(currentSelection.start_date) ? date : currentSelection.start_date;
      const newEndDate = dayjs(date).isBefore(currentSelection.start_date) ? currentSelection.start_date : date;
      const nonOverlappingRanges = tempDateRanges.filter(
        (range) => dayjs(range.start_date).isAfter(newEndDate) || dayjs(range.end_date).isBefore(newStartDate),
      );
      const newRanges = [...nonOverlappingRanges, { start_date: newStartDate, end_date: newEndDate }];
      const mergedRanges = mergeOverlappingRanges(newRanges);
      setTempDateRanges(mergedRanges);
      setCurrentSelection({ start_date: null, end_date: null });
    }
  };

  const renderDateCell = (day: Date | null, dayIndex: number) => {
    if (!day) {
      return <div key={dayIndex} className='flex-1' />;
    }

    const isInRange = tempDateRanges.some((range) => {
      const currentDate = dayjs(day).startOf('day').valueOf();
      const rangeStart = dayjs(range.start_date).startOf('day').valueOf();
      const rangeEnd = dayjs(range.end_date).startOf('day').valueOf();

      if (range?.day_week?.length) {
        // Update
        const dayOfWeek = ((dayjs(day).day() + 6) % 7) + 1;
        return range.day_week.includes(dayOfWeek) && currentDate >= rangeStart && currentDate <= rangeEnd;
      }
      return currentDate >= rangeStart && currentDate <= rangeEnd;
    });
    const isSelectedStart = currentSelection.start_date && dayjs(day).isSame(currentSelection.start_date, 'day');
    const isSelectable = isDateSelectable(day);
    const isCurrentMonth = dayjs(day).isSame(currentMonth, 'month');
    const isPastDate = dayjs(day).isBefore(today, 'day');
    return (
      <div
        key={dayIndex}
        className={cn(
          'flex-1 h-16 flex justify-center items-center mr-1 mb-1 rounded-lg border border-[#E8F1FE] overflow-hidden',
          (!isCurrentMonth || isPastDate) && 'bg-white border-[#E8F1FE] opacity-50',
          (isSelectedStart || isInRange) && 'bg-[#264AF4]',
        )}
      >
        <button
          type='button'
          onClick={() => handleDateSelect(day)}
          className={`
           w-full h-full relative 
           ${!isSelectable ? 'pointer-events-none' : ''}
           focus:outline-none hover:bg-[#3366FF]/30
         `}
          disabled={!isSelectable}
        >
          <div
            className={cn(
              'absolute top-2 right-2 text-sm font-bold text-[#757575]',
              (isSelectedStart || isInRange) && 'text-white',
            )}
          >
            {dayjs(day).format('D')}
          </div>
        </button>
      </div>
    );
  };

  const renderWeekDays = () => (
    <div className='flex'>
      {WEEKDAYS.map((day) => (
        <span
          key={day}
          className={cn('flex-1 text-center text-[0.625rem] font-normal text-[#757575] py-1 bg-[#E8F1FE] mr-1 mb-1')}
        >
          {day}
        </span>
      ))}
    </div>
  );

  const renderDateView = () => {
    const monthStart = dayjs(currentMonth).startOf('month');
    const monthEnd = dayjs(currentMonth).endOf('month');
    const days = Array.from({ length: monthEnd.date() }, (_, i) => monthStart.add(i, 'day').toDate());
    const startDay = monthStart.day();
    const prevMonthDays = Array.from({ length: startDay }).map((_, i) =>
      monthStart.subtract(startDay - i, 'day').toDate(),
    );
    const nextMonthDays = Array.from({
      length: (DAYS_OF_WEEK - ((days.length + startDay) % DAYS_OF_WEEK)) % DAYS_OF_WEEK,
    }).map((_, i) => monthEnd.add(i + 1, 'day').toDate());
    const allDays = [...prevMonthDays, ...days, ...nextMonthDays];
    return (
      <div className='bg-white overflow-hidden'>
        <div className='mt-3'>
          {renderWeekDays()}
          {Array.from({
            length: Math.ceil(allDays.length / DAYS_OF_WEEK),
          }).map((_, weekIndex) => (
            <div key={weekIndex} className='flex flex-1'>
              {Array.from({ length: DAYS_OF_WEEK }).map((_, dayIndex) => {
                const dayNumber = weekIndex * DAYS_OF_WEEK + dayIndex;
                return renderDateCell(allDays[dayNumber], dayIndex);
              })}
            </div>
          ))}
          <div className='my-4'>
            <PaginationCalendar
              currentPage={page}
              totalPage={MAX_MONTHS_AHEAD + 1}
              onPageChange={(value) => {
                setPage(value);
                const nextMonth = dayjs(currentMonth).add(value - page, 'month');
                if (!nextMonth.startOf('month').isAfter(maxSelectableDate)) {
                  setCurrentMonth(nextMonth.toDate());
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => dayjs(prev).subtract(1, 'month').toDate());
  };

  const handleNextMonth = () => {
    const nextMonth = dayjs(currentMonth).add(1, 'month');
    if (!nextMonth.startOf('month').isAfter(maxSelectableDate)) {
      setCurrentMonth(nextMonth.toDate());
    }
  };

  return (
    <div className={classNames}>
      <div className='flex items-center'>
        <Button
          isIconOnly
          variant='light'
          onPress={handlePrevMonth}
          aria-label='btn-keyboard_arrow_left-page'
          isDisabled={dayjs(currentMonth).isSame(dayjs(currentMonthStart), 'month')}
        >
          <Icon
            size={28}
            icon='keyboard_arrow_left'
            className={cn(
              dayjs(currentMonth).isSame(dayjs(currentMonthStart), 'month') ? 'text-[#9CA3AF]' : 'text-[#0017C1]',
            )}
          />
        </Button>
        <div className='flex items-center font-bold text-base'>
          <span>
            {dayjs(currentMonth).format('YYYY')}年{dayjs(currentMonth).format('M')}月
          </span>
        </div>
        <Button
          isIconOnly
          variant='light'
          onPress={handleNextMonth}
          aria-label='btn-keyboard_arrow_right-page'
          isDisabled={dayjs(currentMonth).add(1, 'month').isAfter(maxSelectableDate)}
        >
          <Icon
            icon='keyboard_arrow_right'
            size={28}
            className={cn(
              dayjs(currentMonth).add(1, 'month').isAfter(maxSelectableDate) ? 'text-[#9CA3AF]' : 'text-[#0017C1]',
            )}
          />
        </Button>
      </div>

      {renderDateView()}
    </div>
  );
}

export default CalendarVehicle;
