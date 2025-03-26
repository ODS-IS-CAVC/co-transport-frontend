import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { DatePicker, DatePickerProps, DateValue } from '@nextui-org/react';
import { I18nProvider } from '@react-aria/i18n';
import { useEffect, useState } from 'react';

import { DATE_FORMAT } from '@/constants/constants';
import { cn, convertDateFormatPicker } from '@/lib/utils';

import Label from './Label';

interface CmnDatePickerProps extends Omit<DatePickerProps, 'children'> {
  title?: string;
  helpText?: string;
  classNameWrap?: string;
  classNameInnerWrapper?: string;
  classNameInputWrapper?: string;
  required?: boolean;
  formatDate?: string;
  errorMessage?: string;
  date?: string;
  onChangeValue?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  locale?: string;
}

function CmnDatePicker(props: CmnDatePickerProps) {
  const {
    title,
    helpText,
    classNameWrap,
    classNameInnerWrapper,
    classNameInputWrapper,
    formatDate = DATE_FORMAT.DEFAULT,
    required,
    errorMessage,
    date = today(getLocalTimeZone()).toString(),
    size = 'md',
    onChangeValue = () => null,
    locale = 'ja-JP',
    ...rest
  } = props;

  const [dateValue, setDateValue] = useState<DateValue | null>(
    parseDate(convertDateFormatPicker(date.toString(), formatDate)),
  );

  useEffect(() => {
    setDateValue(parseDate(convertDateFormatPicker(date.toString(), formatDate)));
  }, [date]);

  const handleChangeDate = (value: DateValue | null) => {
    if (!value) return;
    setDateValue(parseDate(convertDateFormatPicker(value.toString(), formatDate)));
    onChangeValue(value?.toString());
  };

  const styleCustom = {
    sm: '!h-[38px] min-h-6',
    md: 'h-[42px] min-h-[42px]',
    lg: 'h-14 min-h-14',
  };

  return (
    <div className={cn('w-full flex flex-col min-w-60', classNameWrap)}>
      {title && <Label title={title} required={required} className='mb-1' />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mb-2'>{helpText}</p>}
      <I18nProvider locale={locale}>
        <DatePicker
          size={size}
          variant='bordered'
          pageBehavior='single'
          validationBehavior='native'
          aria-label={`${title}_${helpText}`}
          classNames={{
            innerWrapper: cn(classNameInnerWrapper),
            inputWrapper: cn(
              'focus-within:border-warning focus-within:border-2',
              'focus-within:hover:!border-warning',
              `bg-white border border-gray-border rounded-lg ${classNameInputWrapper}`,
              styleCustom[size],
            ),
          }}
          calendarProps={{
            classNames: {
              base: 'bg-background',
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
          value={dateValue}
          onChange={handleChangeDate}
          {...rest}
        />
      </I18nProvider>
      {errorMessage && <p className='text-red-500 text-xs mt-2'>{errorMessage}</p>}
    </div>
  );
}

export default CmnDatePicker;
