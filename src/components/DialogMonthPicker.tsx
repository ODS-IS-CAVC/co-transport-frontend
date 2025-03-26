'use client';

import { Button } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalFooter from '@/components/common/modal/CmnModalFooter';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { WEEKDAYS } from '@/lib/dayOfWeek';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = 7;
const MAX_MONTHS_AHEAD = 11;

export interface DialogMonthPickerProps {
  open: boolean;
  onClose: () => void;
  initialEndDate?: Date | null;
  initialStartDate?: Date | null;
  onSelect: (startDate: Date | null, endDate: Date | null) => void;
}

const today = dayjs().startOf('day');
const currentMonthStart = today.startOf('month');
const maxSelectableDate = currentMonthStart.add(MAX_MONTHS_AHEAD, 'month').endOf('month');

function DialogMonthPicker({ open, onClose, onSelect, initialStartDate, initialEndDate }: DialogMonthPickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const isDateSelectable = (date: Date) => {
    return dayjs(date).isSame(today, 'day') || dayjs(date).isAfter(today);
  };

  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now);
  }, []);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  useEffect(() => {
    if (initialStartDate !== undefined) {
      setStartDate(initialStartDate);
    }
    if (initialEndDate !== undefined) {
      setEndDate(initialEndDate);
    }
  }, [initialStartDate, initialEndDate]);

  useEffect(() => {
    if (initialStartDate) {
      setCurrentMonth(initialStartDate);
    }
  }, []);

  const handleDateSelect = (date: Date) => {
    if (isDateSelectable(date)) {
      if (!startDate) {
        setStartDate(date);
        setEndDate(date);
        // onSelect(date, date);
      } else if (dayjs(date).isSame(dayjs(startDate), 'day')) {
        setStartDate(null);
        setEndDate(null);
        // onSelect(null, null);
      } else if (dayjs(date).isBefore(dayjs(startDate))) {
        setStartDate(date);
        setEndDate(date);
        // onSelect(date, date);
      } else if (!endDate || dayjs(endDate).isSame(dayjs(startDate), 'day')) {
        setEndDate(date);
        // onSelect(startDate, date);
      } else {
        setStartDate(date);
        setEndDate(date);
        // onSelect(date, date);
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (startDate && !endDate && hoverDate) {
      const rangeStart = dayjs(startDate).isBefore(dayjs(hoverDate)) ? startDate : hoverDate;
      const rangeEnd = dayjs(startDate).isAfter(dayjs(hoverDate)) ? startDate : hoverDate;
      return (
        dayjs(date).isAfter(dayjs(rangeStart).subtract(1, 'day')) && dayjs(date).isBefore(dayjs(rangeEnd).add(1, 'day'))
      );
    }
    if (startDate && endDate) {
      return (
        dayjs(date).isAfter(dayjs(startDate).subtract(1, 'day')) && dayjs(date).isBefore(dayjs(endDate).add(1, 'day'))
      );
    }
    return false;
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prevMonth) => dayjs(prevMonth).subtract(1, 'month').toDate());
    if (dayjs(currentMonth).month() === 0) {
      setCurrentYear((prevYear) => prevYear - 1);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => dayjs(prevMonth).add(1, 'month').toDate());
    if (dayjs(currentMonth).month() === 11) {
      setCurrentYear((prevYear) => prevYear + 1);
    }
  };

  const renderDateView = () => {
    const monthStart = dayjs(currentMonth).startOf('month').toDate();
    const monthEnd = dayjs(currentMonth).endOf('month').toDate();
    const lastDayToShow = dayjs(monthEnd).add(7, 'day').toDate();
    const days = Array.from({ length: dayjs(lastDayToShow).diff(dayjs(monthStart), 'day') + 1 }, (_, i) =>
      dayjs(monthStart).add(i, 'day').toDate(),
    );

    const startDay = dayjs(monthStart).day();
    const today = new Date();

    return (
      <div className='flex justify-center items-center'>
        <div className='w-[25rem] flex flex-col bg-white overflow-hidden'>
          <div className='mt-1 space-y-1'>
            {/* Weeks */}
            <div className='flex pb-1'>
              {WEEKDAYS.map((day) => (
                <span key={day} className='m-px flex-1 text-center text-base font-medium text-gray-500'>
                  {day}
                </span>
              ))}
            </div>

            {/* Days */}
            {Array.from({
              length: Math.ceil((days.length + startDay) / DAYS_OF_WEEK),
            }).map((_, weekIndex) => (
              <div key={weekIndex} className='flex'>
                {Array.from({ length: DAYS_OF_WEEK }).map((_, dayIndex) => {
                  const dayNumber = weekIndex * DAYS_OF_WEEK + dayIndex - startDay;
                  const day = days[dayNumber];
                  if (!day) {
                    return <div key={dayIndex} className='flex-1' />;
                  }

                  const isInRange = isDateInRange(day);
                  const isStartDate = startDate && dayjs(day).isSame(dayjs(startDate), 'day');
                  const isEndDate = endDate && dayjs(day).isSame(dayjs(endDate), 'day');
                  const isSelectable = isDateSelectable(day);
                  const isToday = dayjs(day).isSame(dayjs(today), 'day');

                  const isFirstDayOfWeek = dayIndex === 0;
                  const isLastDayOfWeek = dayIndex === 6;
                  const isLastDayOfMonth = startDate && dayjs(startDate).isSame(dayjs(day).endOf('month'), 'day');
                  const isFirstDayOfMonth = endDate && dayjs(endDate).isSame(dayjs(day).startOf('month'), 'day');
                  const isStartLastDayOfMonth =
                    startDate && dayjs(startDate).isSame(dayjs(day).endOf('month').subtract(1, 'day'), 'day');
                  const isEndFirstDayOfMonth = endDate && dayjs(endDate).isSame(dayjs(day).startOf('month'), 'day');

                  let roundedClass = '';
                  if (isInRange) {
                    if (isStartDate || isFirstDayOfWeek) {
                      roundedClass += 'rounded-l-full';
                    }
                    if (isEndDate || isLastDayOfWeek) {
                      roundedClass += 'rounded-r-full';
                    }
                    if (isLastDayOfMonth && isInRange && isFirstDayOfMonth) {
                      roundedClass += 'rounded-full';
                    }
                    if (isStartLastDayOfMonth && isInRange && isEndFirstDayOfMonth) {
                      roundedClass += 'rounded-full bg-white text-black';
                    }
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        'flex-1 aspect-square',
                        isEndDate && 'rounded-r-full',
                        isStartDate && 'rounded-l-full',
                        isInRange && `bg-gray-100 ${roundedClass}`,
                      )}
                    >
                      <button
                        type='button'
                        onClick={() => handleDateSelect(day)}
                        className={cn(
                          'w-full h-full flex justify-center items-center text-base font-medium border border-transparent rounded-full relative  hover:border-primary-50 focus:outline-none focus:border-none',
                          isStartDate || isEndDate ? 'bg-[#264AF4] text-white font-bold' : 'text-foreground',
                          !isSelectable && 'opacity-50 pointer-events-none',
                        )}
                        onMouseEnter={(e) => {
                          if (!isTouchDevice) {
                            e.currentTarget.style.border = '0.125rem solid black';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isTouchDevice) {
                            e.currentTarget.style.border = 'none';
                          }
                        }}
                        disabled={!isSelectable}
                      >
                        <div
                          className={cn(
                            'text-base font-medium leading-6 w-8 h-8 flex justify-center items-center text-foreground',
                            isToday && 'text-white bg-[#264AF4] rounded-full',
                            isStartDate && isToday && 'text-foreground bg-white rounded-full',
                            (isEndDate || isStartDate) && !isToday && '!text-white',
                          )}
                        >
                          {dayjs(day).date()}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSelect = () => {
    onSelect(startDate, endDate);
    onClose();
  };

  return (
    <CmnModal placement='top' isOpen={open} onClose={onClose}>
      <CmnModalHeader title='表示する運行日時' />
      <CmnModalBody>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <Button
              isIconOnly
              variant='light'
              onPress={handlePrevMonth}
              aria-label='btn-keyboard_arrow_left-page'
              isDisabled={dayjs(currentMonth).isSame(dayjs(currentMonthStart), 'month')}
            >
              <Icon icon='keyboard_arrow_left' size={24} className='text-current' />
            </Button>
            <div className='text-[1.5rem] text-ink font-inter font-bold mx-2'>
              {dayjs(currentMonth).format('YYYY年M月')}
            </div>
            <Button
              isIconOnly
              variant='light'
              onPress={handleNextMonth}
              aria-label='btn-keyboard_arrow_right-page'
              isDisabled={dayjs(currentMonth).add(1, 'month').isAfter(maxSelectableDate)}
            >
              <Icon icon='keyboard_arrow_right' size={24} className='text-current' />
            </Button>
          </div>
        </div>
        <p className='flex justify-center items-center text-xl font-normal leading-[1.81rem]'>終了日を選んでください</p>
        {renderDateView()}
      </CmnModalBody>

      <CmnModalFooter
        buttonLeftFirst={{
          onPress: onClose,
          children: 'キャンセル',
          className: 'border-1 text-primary w-[8.5rem] font-bold leading-6 text-base',
        }}
        buttonRightSecond={{
          children: '完了',
          onPress: handleSelect,
          className: 'bg-primary text-white w-[8.5rem] font-bold leading-6 text-base',
        }}
      />
    </CmnModal>
  );
}

export default DialogMonthPicker;
