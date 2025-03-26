import { getLocalTimeZone, parseDate } from '@internationalized/date';
import { DateRangePicker, DateRangePickerProps, DateValue, RangeValue } from '@nextui-org/react';
import { I18nProvider, useDateFormatter } from '@react-aria/i18n';
import { useEffect, useLayoutEffect, useState } from 'react';

import { DATE_FORMAT } from '@/constants/constants';
import Vector from '@/icons/Vector';
import dayjs from '@/lib/dayjs';
import { cn, convertDateFormatPicker } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { IDateRange } from '@/types/app';

import Label from './Label';

interface CmnDateRangePickerProps extends Omit<DateRangePickerProps, 'children'> {
  title?: string;
  helpText?: string;
  classNameWrap?: string;
  classNameInnerWrapper?: string;
  classNameInputWrapper?: string;
  required?: boolean;
  formatDate?: string;
  errorMessage?: string;
  date?: IDateRange | null;
  onChangeValue?: (value: IDateRange | null) => void;
}

function CmnDateRangePicker(props: CmnDateRangePickerProps) {
  const {
    title,
    helpText,
    classNameWrap,
    classNameInnerWrapper,
    classNameInputWrapper,
    formatDate = DATE_FORMAT.DEFAULT,
    required,
    errorMessage,
    date,
    size = 'md',
    onChangeValue = () => null,
    ...rest
  } = props;

  let formatter = useDateFormatter({ dateStyle: 'long' });
  const [messageError, setMessageError] = useState<string>(errorMessage || '');

  let [value, setValue] = useState(
    date
      ? {
          start: parseDate(convertDateFormatPicker(date.start, formatDate)),
          end: parseDate(convertDateFormatPicker(date.end, formatDate)),
        }
      : null,
  );

  useEffect(() => {
    setValue(
      date
        ? {
            start: parseDate(convertDateFormatPicker(date.start, formatDate)),
            end: parseDate(convertDateFormatPicker(date.end, formatDate)),
          }
        : null,
    );
  }, [date]);

  useLayoutEffect(() => {
    if (errorMessage) {
      setMessageError(errorMessage);
    }
  }, [errorMessage]);

  const validateDates = (range: IDateRange) => {
    if (range?.start && range?.end) {
      const startDate = new Date(range.start);
      const endDate = new Date(range.end);

      if (startDate > endDate) {
        setMessageError('開始日は終了日より前でなければなりません');
        return false;
      } else {
        setMessageError('');
        return true;
      }
    } else if (required || (range?.start && !range?.end) || (!range?.start && range?.end)) {
      required && setMessageError(gTxt('COMMON.DATE_INPUT.DATE_EMPTY'));
      return false;
    }
  };

  const handleChangeDateRange = (value: RangeValue<DateValue> | null) => {
    if (value && formatter.formatRange(value.start.toDate(getLocalTimeZone()), value.end.toDate(getLocalTimeZone()))) {
      const newDateRange: IDateRange = {
        start: dayjs(new Date(value.start.year, value.start.month - 1, value.start.day)).format(formatDate),
        end: dayjs(new Date(value.end.year, value.end.month - 1, value.end.day)).format(formatDate),
      };
      validateDates(newDateRange);
      onChangeValue(newDateRange);
    } else {
      onChangeValue(null);
      required && setMessageError(gTxt('COMMON.DATE_INPUT.DATE_EMPTY'));
    }
  };

  const styleCustom = {
    sm: 'h-6 min-h-6', // 24px
    md: 'h-[42px] min-h-[42px]', // 42px
    lg: 'h-14 min-h-14', // 56px
  };

  const getSizeIcon = {
    sm: '16px',
    md: '20px',
    lg: '22px',
  };

  function handleBlur(): void {
    // if (value) {
    //   const isValid = validateDates({
    //     start: value.start?.toString(),
    //     end: value.end?.toString(),
    //   });
    // }
  }

  return (
    <div className={cn('w-full flex flex-col min-w-60', classNameWrap)}>
      {title && <Label title={title} required={required} className='mb-1' />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mb-2'>{helpText}</p>}
      <I18nProvider locale='ja-JP'>
        <DateRangePicker
          size={size}
          variant='bordered'
          visibleMonths={2}
          pageBehavior='single'
          // validationBehavior='native'
          aria-label={`${title}_${helpText}`}
          selectorIcon={<Vector size={getSizeIcon[size]} />}
          classNames={{
            innerWrapper: [`${classNameInnerWrapper}`],
            inputWrapper: [
              'focus-within:border-warning focus-within:border-2',
              'focus-within:hover:!border-warning',
              `bg-white border border-gray-border rounded-lg ${classNameInputWrapper}`,
              styleCustom[size],
            ],
          }}
          calendarProps={{
            classNames: {
              base: 'bg-white',
              title: 'text-foreground',
              gridHeaderRow: 'text-foreground font-medium',
              headerWrapper: 'text-primary',
              prevButton: 'text-foreground',
              nextButton: 'text-foreground',
              gridBody: 'bg-white',
              cellButton: [
                'data-[today=true]:bg-default-100 data-[selected=true]:bg-background rounded-none',
                'data-[range-start=true]:rounded-l-small',
                'data-[range-end=true]:rounded-r-small',
                'data-[selected=true]:data-[range-selection=true]:before:bg-background',
                'data-[selected=true]:data-[selection-start=true]:data-[range-selection=true]:rounded-small',
                'data-[selected=true]:data-[selection-end=true]:data-[range-selection=true]:rounded-small',
              ],
            },
          }}
          value={value}
          isInvalid={!!messageError}
          errorMessage={messageError}
          onChange={handleChangeDateRange}
          onBlur={handleBlur}
          {...rest}
        />
      </I18nProvider>
    </div>
  );
}

export default CmnDateRangePicker;
