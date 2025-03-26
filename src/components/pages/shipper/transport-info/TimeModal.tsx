'use client';

import { Button, Checkbox, ModalFooter } from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';

import CmnCheckboxGroup from '@/components/common/CmnCheckboxGroup';
import CmnDropdown from '@/components/common/CmnDropdown';
import CmnTimeInput, { TimeString } from '@/components/common/CmnTimeInput';
import DialogMonthPicker from '@/components/common/dialog/DialogMonthPicker';
import { Icon } from '@/components/common/Icon';
import CmnModal from '@/components/common/modal/CmnModal';
import CmnModalBody from '@/components/common/modal/CmnModalBody';
import CmnModalHeader from '@/components/common/modal/CmnModalHeader';
import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import dayjs from '@/lib/dayjs';
import { DAY_OF_WEEK_LIST_CHECKBOX, LST_CHECKBOX_WEEKDAYS_START_MONDAY } from '@/lib/dayOfWeek';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { DayWeek, TransportPlanTime } from '@/types/shipper/transportList';

import { CmnMonthPagination } from './CmnMonthPagination';

interface TimeModalProps {
  isOpen: boolean;
  modeView: boolean;
  detailData: TransportPlanTime;
  onClose: () => void;
  updateData: (data: TransportPlanTime) => void;
}

const TimeModal = (props: TimeModalProps) => {
  const { isOpen, modeView, detailData, onClose, updateData } = props;

  const [modeEdit, setModeEdit] = useState<boolean>(false);
  const [data, setData] = useState<TransportPlanTime>(detailData);

  //setting
  const [settingDuration, setSettingDuration] = useState<boolean>(false);
  const [settingDayWeek, setSettingDayWeek] = useState<boolean>(false);
  const [dateFrom, setDateFrom] = useState<string | null>(detailData.date_from);
  const [dateTo, setDateTo] = useState<string | null>(detailData.date_to);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [startDayWeek, setStartDayWeek] = useState<string | null>(null);
  const [endDayWeek, setEndDayWeek] = useState<string | null>(null);
  const [dayWeekExclusion, setDayWeekExclusion] = useState<number[]>([]);
  //time
  const [startAllTime, setStartAllTime] = useState<string | null>(detailData.time_from);
  const [endAllTime, setEndAllTime] = useState<string | null>(detailData.time_to);
  const [startDurationTime, setStartDurationTime] = useState<string | null>(null);
  const [endDurationTime, setEndDurationTime] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (detailData && detailData.date_from && detailData.date_to) {
      const date = dayjs(detailData.date_from, DATE_FORMAT.YYYYMMDD);
      setSelectedMonth(new Date(date.year(), date.month(), date.date()));
    }
  }, [detailData]);

  const DAY_OF_WEEK = LST_CHECKBOX_WEEKDAYS_START_MONDAY.map((item) => ({
    dayOfWeek: Number(item.key),
    day: item.label,
  }));

  const formatTimeHHmm = (time?: string | null, currentFormat?: string) => {
    return time ? dayjs(time, currentFormat || TIME_FORMAT.HHMMSS).format(TIME_FORMAT.HH_MM) : null;
  };

  const formatTimeRequest = (time?: string | null) => {
    return time ? dayjs(time, TIME_FORMAT.HH_MM).format(TIME_FORMAT.HHMM) : null;
  };

  const formatDate = (date?: string) => {
    if (!date) return '';
    return dayjs(date, DATE_FORMAT.YYYYMMDD).format(DATE_FORMAT.DEFAULT);
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return dayjs(time, TIME_FORMAT.HHMM).format(TIME_FORMAT.A_hh_mm);
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

  const now = dayjs();
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

  const handleDayClick = () => {
    //TODO
  };

  const isDisabledPrev = useMemo(() => {
    // disable prev button if selected month is the month of selected month
    if (data.date_from) {
      return !dayjs(selectedMonth).isAfter(dayjs(data.date_from, DATE_FORMAT.YYYYMMDD), 'month');
    } else {
      // disable prev button if selected month is the first month of the year
      const firstMonthOfYear = now.startOf('year');
      return !dayjs(selectedMonth).isAfter(firstMonthOfYear, 'month');
    }
  }, [selectedMonth, data.date_from]);

  const isDisabledNext = useMemo(() => {
    // disable next button if selected month is the last month of the year
    if (data.date_to) {
      return !dayjs(selectedMonth).isBefore(dayjs(data.date_to, DATE_FORMAT.YYYYMMDD), 'month');
    } else {
      // disable next button if selected month is the last month of the year
      const lastMonthOfYear = now.endOf('year');
      return !dayjs(selectedMonth).isBefore(lastMonthOfYear, 'month');
    }
  }, [selectedMonth, data.date_to]);

  const checkDisabled = (dateString: string) => {
    // check disabled data.date_from to data.date_to
    if (data.date_from == null || data.date_to == null) return true;
    const selectedDate = dayjs(dateString, DATE_FORMAT.YYYYMMDD);
    if (
      selectedDate.isBefore(dayjs(data.date_from, DATE_FORMAT.YYYYMMDD)) ||
      selectedDate.isAfter(dayjs(data.date_to, DATE_FORMAT.YYYYMMDD))
    ) {
      return true;
    }
    return false;
  };

  const checkedForDayOfWeek = (dayOfWeek: number) => {
    if (!data.date_from || !data.date_to) return false;

    // Get first and last day of selected month
    const firstDayOfMonth = dayjs(new Date(year, month, 1)).format(DATE_FORMAT.YYYYMMDD);
    const lastDayOfMonth = dayjs(new Date(year, month + 1, 0)).format(DATE_FORMAT.YYYYMMDD);

    const rangeStart = dayjs(data.date_from, DATE_FORMAT.YYYYMMDD).isAfter(dayjs(firstDayOfMonth))
      ? dayjs(data.date_from, DATE_FORMAT.YYYYMMDD)
      : dayjs(firstDayOfMonth);
    const rangeEnd = dayjs(data.date_to, DATE_FORMAT.YYYYMMDD).isBefore(dayjs(lastDayOfMonth))
      ? dayjs(data.date_to, DATE_FORMAT.YYYYMMDD)
      : dayjs(lastDayOfMonth);
    const daysDiff = rangeEnd.diff(rangeStart, 'day');
    // Check each date between date_from and date_to
    let checked = false;
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = rangeStart.add(i, 'day');
      const currentDayOfWeek = currentDate.day() === 0 ? 7 : currentDate.day();
      // Check if the current date is the specified day of week (7 = Sunday, 1 = Monday, etc.)
      if (currentDayOfWeek === dayOfWeek) {
        const dateString = currentDate.format(DATE_FORMAT.YYYYMMDD);
        // If this day has time settings in day_week, it means it's selected
        checked = selectedDays.includes(dateString);
      }
    }
    return checked;
  };

  const handleOnChangeSelectedDayOfWeek = (value: boolean, dayOfWeek: number) => {
    if (!data.date_from || !data.date_to) return;

    const firstDayOfMonth = dayjs(new Date(year, month, 1)).format(DATE_FORMAT.YYYYMMDD);
    const lastDayOfMonth = dayjs(new Date(year, month + 1, 0)).format(DATE_FORMAT.YYYYMMDD);

    const rangeStart = dayjs(data.date_from, DATE_FORMAT.YYYYMMDD).isAfter(dayjs(firstDayOfMonth))
      ? dayjs(data.date_from, DATE_FORMAT.YYYYMMDD)
      : dayjs(firstDayOfMonth);
    const rangeEnd = dayjs(data.date_to, DATE_FORMAT.YYYYMMDD).isBefore(dayjs(lastDayOfMonth))
      ? dayjs(data.date_to, DATE_FORMAT.YYYYMMDD)
      : dayjs(lastDayOfMonth);

    const daysDiff = rangeEnd.diff(rangeStart, 'day');
    const newSelectedDays = [...selectedDays];

    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = rangeStart.add(i, 'day');
      const currentDayOfWeek = currentDate.day() === 0 ? 7 : currentDate.day();
      if (currentDayOfWeek === dayOfWeek) {
        const dateString = currentDate.format(DATE_FORMAT.YYYYMMDD);
        if (value) {
          if (!newSelectedDays.includes(dateString)) {
            newSelectedDays.push(dateString);
          }
        } else {
          const index = newSelectedDays.indexOf(dateString);
          if (index > -1) {
            newSelectedDays.splice(index, 1);
          }
        }
      }
    }
    setSelectedDays(newSelectedDays);
  };

  const handleSetDuringThisPeriod = (startDate: Date | null, endDate: Date | null) => {
    setDateFrom(startDate ? dayjs(startDate).format(DATE_FORMAT.YYYYMMDD) : null);
    setDateTo(endDate ? dayjs(endDate).format(DATE_FORMAT.YYYYMMDD) : null);
  };

  const handleSetDurationDay = (startDate: Date | null, endDate: Date | null) => {
    setStartDate(startDate ? dayjs(startDate).format(DATE_FORMAT.YYYYMMDD) : null);
    setEndDate(endDate ? dayjs(endDate).format(DATE_FORMAT.YYYYMMDD) : null);
  };

  const handleSetDayWeek = (startDate: Date | null, endDate: Date | null) => {
    setStartDayWeek(startDate ? dayjs(startDate).format(DATE_FORMAT.YYYYMMDD) : null);
    setEndDayWeek(endDate ? dayjs(endDate).format(DATE_FORMAT.YYYYMMDD) : null);
  };

  const handleChangeDayWeek = (
    beforeDayWeek: DayWeek,
    fromDate: string,
    toDate: string,
    startTime: string | null,
    endTime: string | null,
  ) => {
    const dayWeek: DayWeek = { ...beforeDayWeek };
    for (let i = 0; i <= dayjs(toDate).diff(dayjs(fromDate), 'day'); i++) {
      const date = dayjs(fromDate).add(i, 'day');
      dayWeek[date.format(DATE_FORMAT.YYYYMMDD)] = {
        fromTime: startTime || '',
        toTime: endTime || '',
      };
    }
    return dayWeek;
  };

  const setDuringThisPeriod = () => {
    if (dateFrom && dateTo) {
      const dayWeek = handleChangeDayWeek({}, dateFrom, dateTo, data.time_from, data.time_to);
      setData({
        ...data,
        date_from: dateFrom ? dayjs(dateFrom).format(DATE_FORMAT.YYYYMMDD) : null,
        date_to: dateTo ? dayjs(dateTo).format(DATE_FORMAT.YYYYMMDD) : null,
        day_week: dayWeek,
      });
      // if selected month is before date_from, set selected month to date_from
      if (dayjs(selectedMonth).isBefore(dayjs(dateFrom, DATE_FORMAT.YYYYMMDD), 'month')) {
        // Parse YYYYMMDD format to Date object
        const year = parseInt(dateFrom.substring(0, 4));
        const month = parseInt(dateFrom.substring(4, 6)) - 1; // Months are 0-based
        const day = parseInt(dateFrom.substring(6, 8));
        setSelectedMonth(new Date(year, month, day));
      }
    }
  };

  const setTimeAllDay = () => {
    if (data.date_from && data.date_to && startAllTime && endAllTime) {
      const dayWeek = handleChangeDayWeek({}, data.date_from, data.date_to, startAllTime, endAllTime);
      setData({
        ...data,
        time_from: startAllTime,
        time_to: endAllTime,
        day_week: dayWeek,
      });
    }
  };

  const setDurationDay = () => {
    if (data.date_from && data.date_to && startDate && endDate && startDurationTime && endDurationTime) {
      //check startDate for data.date_from
      let _startDate = dayjs(startDate, DATE_FORMAT.YYYYMMDD).isBefore(dayjs(data.date_from, DATE_FORMAT.YYYYMMDD))
        ? data.date_from
        : startDate;
      //check endDate for data.date_to
      let _endDate = dayjs(endDate, DATE_FORMAT.YYYYMMDD).isAfter(dayjs(data.date_to, DATE_FORMAT.YYYYMMDD))
        ? data.date_to
        : endDate;
      const dayWeek = handleChangeDayWeek(
        data.day_week || {},
        _startDate,
        _endDate,
        startDurationTime,
        endDurationTime,
      );
      setData({
        ...data,
        day_week: dayWeek,
      });
      setStartDate(null);
      setEndDate(null);
      setStartDurationTime(null);
      setEndDurationTime(null);
    }
  };

  const handleAddDayWeekExclusion = () => {
    if (!startDayWeek || !endDayWeek) return;
    const dayWeek = { ...data.day_week };
    const dateExclusion = [];
    for (let i = 0; i <= dayjs(endDayWeek).diff(dayjs(startDayWeek), 'day'); i++) {
      const date = dayjs(startDayWeek).add(i, 'day');
      const currentDayOfWeek = date.day() === 0 ? 7 : date.day();
      if (dayWeekExclusion.includes(currentDayOfWeek)) {
        dateExclusion.push(date.format(DATE_FORMAT.YYYYMMDD));
      }
    }
    // remove dateExclusion from dayWeek
    for (const date of dateExclusion) {
      delete dayWeek[date];
    }
    setData({
      ...data,
      day_week: dayWeek,
    });
  };

  const setTimeToSelectedDay = () => {
    // set start time, end time to selected day
    if (data.date_from && data.date_to && selectedDays.length > 0 && startTime && endTime) {
      const dayWeek = { ...data.day_week };
      for (const date of selectedDays) {
        dayWeek[date] = {
          fromTime: startTime,
          toTime: endTime,
        };
      }
      setData({
        ...data,
        day_week: dayWeek,
      });
      setSelectedDays([]);
      setStartTime(null);
      setEndTime(null);
    }
  };

  const listMonth = useMemo(() => {
    if (!data.date_from) return [];
    if (!data.date_to) return [];
    const listMonth = [];
    const monthStartDateStr = dayjs(data.date_from, DATE_FORMAT.YYYYMMDD).format(DATE_FORMAT.YYYYMM);
    const monthEndDateStr = dayjs(data.date_to, DATE_FORMAT.YYYYMMDD).format(DATE_FORMAT.YYYYMM);

    const startMonth = dayjs(monthStartDateStr, DATE_FORMAT.YYYYMM);
    const endMonth = dayjs(monthEndDateStr, DATE_FORMAT.YYYYMM);
    // get list month from data.date_from to data.date_to
    const diffMonth = endMonth.diff(startMonth, 'month');

    for (let i = 0; i <= diffMonth; i++) {
      const _date = dayjs(data.date_from, DATE_FORMAT.YYYYMMDD).add(i, 'month');
      const _year = _date.year();
      const _month = _date.month();
      const monthStr = `${_year}年${_month + 1}月`;
      listMonth.push({
        monthStr,
        year: _year,
        month: _month + 1,
      });
    }
    return listMonth;
  }, [data.date_from, data.date_to]);

  const renderTimeItem = (timeData: { fromTime: string; toTime: string } | null) => {
    if (!timeData || !timeData.toTime || !timeData.fromTime) return null;
    // get AM/PM for toTime
    const amPm = dayjs(timeData.toTime, TIME_FORMAT.HHMM).hour() >= 12 ? 'PM' : 'AM';
    // get time for toTime (12h)
    const time = dayjs(timeData.toTime, TIME_FORMAT.HHMM).format(TIME_FORMAT.H_MM_12);
    return (
      <div className='flex items-center justify-start space-x-1'>
        <div className='bg-primary text-white text-[10px] font-normal rounded-md px-1'>{amPm}</div>
        <div className='text-md text-foreground font-normal'>{time}</div>
      </div>
    );
  };

  return (
    <CmnModal size='4xl' isOpen={isOpen} onClose={onClose}>
      <CmnModalHeader
        title={
          <div className='flex items-center justify-between'>
            <label className='!text-3xl !font-normal'>{modeEdit ? '日時情報の修正' : '日時情報詳細'}</label>
            {!modeEdit && !modeView && (
              <Button
                size='lg'
                color='primary'
                radius='sm'
                className='font-bold'
                variant='ghost'
                onPress={() => setModeEdit(true)}
              >
                日時情報を修正する
              </Button>
            )}
          </div>
        }
        description={
          modeEdit
            ? '輸送日時、持込期限(カットオフ)、繰り返し設定が行えます。'
            : '輸送日時、持込期限(カットオフ)の詳細です。'
        }
      />
      <CmnModalBody>
        <div className='flex flex-col items-start border border-primary rounded-md p-2'>
          {modeEdit && (
            <>
              <div className='flex items-center space-x-2'>
                <span className='font-bold'>輸送日時</span>
                <DialogMonthPicker
                  initialStartDate={dateFrom ? dayjs(dateFrom, DATE_FORMAT.YYYYMMDD).toDate() : null}
                  initialEndDate={dateTo ? dayjs(dateTo, DATE_FORMAT.YYYYMMDD).toDate() : null}
                  onSelect={handleSetDuringThisPeriod}
                />
                <Button size='md' radius='sm' color='primary' onPress={setDuringThisPeriod}>
                  この期間で設定
                </Button>
              </div>
              <div className='mt-4 flex items-center space-x-2'>
                <span className='font-bold'>基本持込期限(カットオフ)</span>
                <CmnTimeInput
                  classNameWrap='w-44 min-w-44'
                  size='md'
                  disabled={!data.date_from || !data.date_to}
                  defaultTimeStart={formatTimeHHmm(startAllTime, TIME_FORMAT.HHMM) as TimeString | undefined}
                  defaultTimeEnd={formatTimeHHmm(endAllTime, TIME_FORMAT.HHMM) as TimeString | undefined}
                  onChangeTime={(data: any) => {
                    const dataTime = {
                      timeStart: data.timeStart ? formatTimeRequest(data.timeStart) : null,
                      timeEnd: data.timeEnd ? formatTimeRequest(data.timeEnd) : null,
                    };
                    setStartAllTime(dataTime.timeStart);
                    setEndAllTime(dataTime.timeEnd);
                  }}
                />
                <Button
                  size='md'
                  radius='sm'
                  color='primary'
                  onPress={setTimeAllDay}
                  isDisabled={!data.date_from || !data.date_to}
                >
                  期間内の全ての日に適用
                </Button>
              </div>
              <div className='mt-4 flex items-center'>
                <CmnCheckboxGroup
                  size='md'
                  option={[{ key: '1', value: '1', label: '繰り返しを設定する' }]}
                  value={settingDuration ? ['1'] : []}
                  onChange={(e) => {
                    setSettingDuration(e.length > 0);
                  }}
                />
              </div>
              {settingDuration && (
                <>
                  <div className='mt-4 w-full flex flex-col items-start border border-primary rounded-md p-2 space-y-4'>
                    <CmnDropdown
                      classNameWrap='min-w-60 w-60'
                      placeholder={gTxt('COMMON.LABEL_PLEASE_SELECT_VEHICLE')}
                      items={[{ key: '1', label: '開始日と終了日で設定する' }]}
                      size='md'
                      disallowEmptySelection
                      selectedKeys={['1']}
                    />
                    <DialogMonthPicker
                      initialStartDate={startDate ? dayjs(startDate, DATE_FORMAT.YYYYMMDD).toDate() : null}
                      initialEndDate={endDate ? dayjs(endDate, DATE_FORMAT.YYYYMMDD).toDate() : null}
                      onSelect={handleSetDurationDay}
                    />
                    <div className='w-full flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <span className='font-bold'>持込期限(カットオフ)</span>
                        <CmnTimeInput
                          classNameWrap='w-44 min-w-44'
                          size='md'
                          defaultTimeStart={
                            formatTimeHHmm(startDurationTime, TIME_FORMAT.HHMM) as TimeString | undefined
                          }
                          defaultTimeEnd={formatTimeHHmm(endDurationTime, TIME_FORMAT.HHMM) as TimeString | undefined}
                          onChangeTime={(data: any) => {
                            const dataTime = {
                              timeStart: data.timeStart ? formatTimeRequest(data.timeStart) : null,
                              timeEnd: data.timeEnd ? formatTimeRequest(data.timeEnd) : null,
                            };
                            setStartDurationTime(dataTime.timeStart);
                            setEndDurationTime(dataTime.timeEnd);
                          }}
                        />
                      </div>
                      <Button
                        size='md'
                        radius='sm'
                        color='primary'
                        isDisabled={
                          !data.date_from ||
                          !data.date_to ||
                          !startDate ||
                          !endDate ||
                          !startDurationTime ||
                          !endDurationTime
                        }
                        onPress={setDurationDay}
                      >
                        期間内の全ての日に適用
                      </Button>
                    </div>
                  </div>
                  <div className='mt-2 text-xs font-normal text-gray-border'>日付を選択してください</div>
                </>
              )}
              <div className='mt-4 text-xl font-bold'>輸送除外期間の設定</div>
              <div className='mt-2 text-xs font-normal text-gray-border'>
                輸送を実行しない期間を設定してリストに加えてください。
              </div>
              <div className='mt-4 w-full flex flex-col items-start border border-primary rounded-md p-2 space-y-4'>
                <CmnCheckboxGroup
                  size='md'
                  option={[{ key: '1', value: '1', label: '期間を日付で設定する' }]}
                  value={settingDayWeek ? ['1'] : []}
                  isDisabled={!data.date_from || !data.date_to}
                  onChange={(e) => {
                    setSettingDayWeek(e.length > 0);
                  }}
                />
                {settingDayWeek && (
                  <>
                    <DialogMonthPicker
                      initialStartDate={startDayWeek ? dayjs(startDayWeek, DATE_FORMAT.YYYYMMDD).toDate() : null}
                      initialEndDate={endDayWeek ? dayjs(endDayWeek, DATE_FORMAT.YYYYMMDD).toDate() : null}
                      onSelect={handleSetDayWeek}
                    />
                    <CmnCheckboxGroup
                      size='md'
                      option={DAY_OF_WEEK_LIST_CHECKBOX}
                      value={dayWeekExclusion.map((item) => item.toString())}
                      isDisabled={!data.date_from || !data.date_to}
                      onChange={(e) => {
                        setDayWeekExclusion(e.map((item) => parseInt(item)));
                      }}
                    />
                    <div className='w-full flex items-center justify-end'>
                      <Button
                        size='md'
                        radius='sm'
                        color='primary'
                        isDisabled={!startDayWeek || !endDayWeek}
                        onPress={handleAddDayWeekExclusion}
                      >
                        この期間を輸送除外期間に加える
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
          <div className='mt-4'>
            <div className='w-full bg-white p-2'>
              <div className='flex items-center mb-2'>
                <Button
                  isIconOnly
                  aria-label='previous-button'
                  variant='light'
                  size='md'
                  color='default'
                  onPress={handlePrev}
                  isDisabled={isDisabledPrev}
                >
                  <Icon icon='arrow_back_ios' size={20} />
                </Button>
                <span className='font-bold text-[1.375rem] mx-2'>{`${year}年${month + 1}月`}</span>
                <Button
                  isIconOnly
                  aria-label='next-button'
                  variant='light'
                  size='md'
                  color='default'
                  isDisabled={isDisabledNext}
                  onPress={handleNext}
                >
                  <Icon icon='arrow_forward_ios' size={20} />
                </Button>
              </div>
              {!modeEdit && (
                <>
                  <div className='flex flex-col items-start'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-bold'>輸送日時</span>
                      <span>{`${data.date_from && data.date_to ? `${formatDate(data.date_from)} - ${formatDate(data.date_to)}` : '-'}`}</span>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='font-bold'>基本持込期限(カットオフ)</span>
                      <span>{`${data.time_from && data.time_to ? `${formatTime(data.time_from)} - ${formatTime(data.time_to)}` : '-'}`}</span>
                    </div>
                  </div>
                </>
              )}
              <table className='w-full border-collapse table-fixed mt-2'>
                <thead>
                  <tr>
                    {DAY_OF_WEEK.map((day) => (
                      <th key={day.day} className='text-xs text-[#717579] p-[1px]'>
                        <div
                          className={cn(
                            'bg-background flex items-center p-1',
                            modeEdit ? 'justify-start space-x-3' : 'justify-center',
                          )}
                        >
                          {modeEdit && (
                            <Checkbox
                              radius='none'
                              size='md'
                              isSelected={checkedForDayOfWeek(day.dayOfWeek)}
                              onValueChange={(value) => handleOnChangeSelectedDayOfWeek(value, day.dayOfWeek)}
                            ></Checkbox>
                          )}
                          <span>{day.day}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }, (_, weekIndex) => (
                    <tr key={weekIndex} className={cn('')}>
                      {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((dayInfo, index) => {
                        //get dateString format YYYYMMDD,
                        const dateString = `${dayInfo.year}${dayInfo.month.toString().padStart(2, '0')}${dayInfo.day.toString().padStart(2, '0')}`;
                        const timeData = data.day_week ? data.day_week[dateString] : null;
                        const isNotCurrentMonth = !dayInfo.isCurrentMonth;
                        return (
                          <td
                            key={index}
                            className={cn(
                              'p-[1px] text-base font-bold text-other-gray',
                              isNotCurrentMonth ? 'opacity-50' : '',
                            )}
                            onClick={() => handleDayClick()}
                          >
                            <div className={cn('p-1', isNotCurrentMonth ? '' : 'border border-background')}>
                              <div className={cn('flex items-center', modeEdit ? 'justify-between' : 'justify-end')}>
                                {modeEdit && (
                                  <Checkbox
                                    radius='none'
                                    size='md'
                                    isSelected={selectedDays.includes(dateString)}
                                    isDisabled={checkDisabled(dateString) || !dayInfo.isCurrentMonth}
                                    onValueChange={(value) => {
                                      if (value) {
                                        const _selectedDay = Array.from(selectedDays);
                                        _selectedDay.push(dateString);
                                        setSelectedDays(_selectedDay);
                                      } else {
                                        setSelectedDays(selectedDays.filter((day) => day !== dateString));
                                      }
                                    }}
                                  ></Checkbox>
                                )}
                                <div className='text-base font-bold'>{dayInfo.day}</div>
                              </div>
                              <div className='mt-1 h-[1.375rem] flex items-center justify-start'>
                                {renderTimeItem(timeData)}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {modeEdit && (
                <div className='flex items-center justify-between border border-primary rounded-md p-2 mt-2'>
                  <div className='w-full flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <span className='font-bold'>持込期限(カットオフ)</span>
                      <CmnTimeInput
                        classNameWrap='w-44 min-w-44'
                        size='md'
                        disabled={!data.date_from || !data.date_to || selectedDays.length == 0}
                        defaultTimeStart={formatTimeHHmm(startTime, TIME_FORMAT.HHMM) as TimeString | undefined}
                        defaultTimeEnd={formatTimeHHmm(endTime, TIME_FORMAT.HHMM) as TimeString | undefined}
                        onChangeTime={(data: any) => {
                          const dataTime = {
                            timeStart: data.timeStart ? formatTimeRequest(data.timeStart) : null,
                            timeEnd: data.timeEnd ? formatTimeRequest(data.timeEnd) : null,
                          };
                          setStartTime(dataTime.timeStart);
                          setEndTime(dataTime.timeEnd);
                        }}
                      />
                    </div>
                    <Button
                      size='md'
                      radius='sm'
                      color='primary'
                      isDisabled={
                        !data.date_from || !data.date_to || selectedDays.length == 0 || !startTime || !endTime
                      }
                      onPress={setTimeToSelectedDay}
                    >
                      期間内の全ての日に適用
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {data.date_from && data.date_to && (
          <CmnMonthPagination
            currentMonth={selectedMonth}
            listMonth={listMonth}
            onPageChange={(page) => {
              const monthPage = listMonth[page - 1];
              const date = new Date(monthPage.year, monthPage.month - 1, 1);
              setSelectedMonth(date);
            }}
          />
        )}
      </CmnModalBody>
      <ModalFooter className={cn('flex items-center', modeEdit ? 'justify-between' : 'justify-center')}>
        {modeEdit ? (
          <>
            <Button
              className='font-bold text-base text-primary leading-normal bg-background'
              size='lg'
              radius='sm'
              onPress={onClose}
            >
              編集を中止
            </Button>
            <Button
              className='font-bold text-base leading-normal'
              size='lg'
              radius='sm'
              color='primary'
              onPress={() => updateData(data)}
            >
              編集を完了する
            </Button>
          </>
        ) : (
          <Button
            className='font-bold text-base leading-normal'
            size='lg'
            radius='sm'
            color='primary'
            onPress={onClose}
          >
            閉じる
          </Button>
        )}
      </ModalFooter>
    </CmnModal>
  );
};

export default TimeModal;
