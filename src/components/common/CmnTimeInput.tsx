import { Time } from '@internationalized/date';
import { TimeInput } from '@nextui-org/react';
import { useEffect, useLayoutEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';

import ErrorMessage from '../common/ErrorMessage';
import { Icon } from '../common/Icon';
import Label from '../common/Label';

export type TimeString = `${number}:${number}`;

interface CmnTimeInputProps {
  title?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  txtRequired?: string;
  classNameWrap?: string;
  classNameInputWrapper?: string;
  size?: 'sm' | 'md' | 'lg';
  errorMessage?: string;
  defaultTimeStart?: TimeString; // 11:00
  defaultTimeEnd?: TimeString; // 12:00
  validateRange?: boolean;
  onError?: (message: string) => void;
  onChangeTime?: (data: { timeStart?: TimeString; timeEnd?: TimeString }) => void;
  showBtnDelete?: boolean;
}

function CmnTimeInput(props: CmnTimeInputProps) {
  const {
    title,
    helpText,
    required,
    classNameWrap,
    txtRequired,
    classNameInputWrapper,
    size = 'md',
    errorMessage,
    defaultTimeStart,
    defaultTimeEnd,
    disabled,
    validateRange = true,
    onError = () => null,
    onChangeTime = () => null,
    showBtnDelete,
  } = props;

  const [focus, setFocus] = useState(false);

  const [timeStart, setTimeStart] = useState<TimeString | undefined>(defaultTimeStart);

  const [timeEnd, setTimeEnd] = useState<TimeString | undefined>(defaultTimeEnd);

  const [messageError, setMessageError] = useState<string>(errorMessage || '');

  useLayoutEffect(() => {
    if (errorMessage) {
      setMessageError(errorMessage);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (JSON.stringify(defaultTimeStart) != JSON.stringify(timeStart)) {
      setTimeStart(defaultTimeStart);
    }
    if (JSON.stringify(defaultTimeEnd) != JSON.stringify(timeEnd)) {
      setTimeEnd(defaultTimeEnd);
    }
  }, [defaultTimeStart, defaultTimeEnd]);

  const getSizeIcon = {
    sm: 20,
    md: 26,
    lg: 30,
  };

  const getMessage = () => {
    let message = '';
    if (!timeEnd) {
      message = gTxt('COMMON.TIME_INPUT.TIME_END_EMPTY');
    } else if (!timeStart) {
      message = gTxt('COMMON.TIME_INPUT.TIME_START_EMPTY');
    } else if (validateRange && timeEnd < timeStart) {
      message = gTxt('COMMON.TIME_INPUT.TIME_ERROR');
    } else if (timeEnd === timeStart) {
      message = gTxt('COMMON.TIME_INPUT.TIME_EQUAL');
    }

    return message;
  };

  const handleChange = (value: Time | null, isTimeStart?: boolean) => {
    if (!value) {
      if ((isTimeStart && !timeEnd) || (!isTimeStart && !timeStart)) {
        setMessageError('');
        onError('');
        return isTimeStart ? setTimeStart(undefined) : setTimeEnd(undefined);
      }
      return;
    }
    onError('');
    setMessageError('');
    const timeString = `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
    isTimeStart ? setTimeStart(timeString as TimeString) : setTimeEnd(timeString as TimeString);
    let data = {
      timeStart: isTimeStart ? timeString : timeStart,
      timeEnd: !isTimeStart ? timeString : timeEnd,
    };
    onChangeTime(data as { timeStart?: TimeString; timeEnd?: TimeString });
  };

  const handleDelete = () => {
    setTimeStart(undefined);
    setTimeEnd(undefined);
    setMessageError('');
    onError('');
    onChangeTime({ timeStart: undefined, timeEnd: undefined });
  };

  const handleBlur = () => {
    if (
      (!timeStart && timeEnd) ||
      (!timeEnd && timeStart) ||
      (timeEnd && timeStart && timeEnd < timeStart) ||
      (timeEnd && timeStart && timeEnd === timeStart)
    ) {
      onError(getMessage());
      setMessageError(getMessage());
    } else {
      onError('');
      setMessageError('');
    }
  };

  const convertTime = (time?: TimeString) => {
    if (!time) return;
    const [hours, minutes] = time.split(':').map(Number);
    return new Time(hours, minutes);
  };

  const styleCustom = {
    sm: 'h-6 min-h-6 px-2', // 24px
    md: 'h-9 min-h-9 px-2', // 36px
    lg: 'h-14 min-h-14 px-3', // 56px
  };

  const styleInput = {
    sm: '!text-sm !font-normal !leading-[1.75] !tracking-[0.035rem] ',
    md: '!text-base !font-normal !leading-[1.75] !tracking-[0.04rem]',
    lg: '!text-base !font-normal !leading-[1.7] !tracking-[0.04rem]',
  };

  return (
    <div className={classNameWrap}>
      {title && <Label title={title} required={required} txtRequired={txtRequired} />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mt-2'>{helpText}</p>}
      <div className='relative flex items-center space-x-2'>
        <div
          className={cn(
            'flex flex-1 items-center justify-between border border-[#D9D9D9] rounded-lg',
            focus && 'border-warning border-2 text-primary',
            messageError && 'border-error text-error',
            (title || helpText) && 'mt-2',
            disabled && 'bg-gray-100 cursor-not-allowed',
            styleCustom[size],
          )}
        >
          <div className={cn('flex items-center justify-center', size !== 'sm' && 'mb-1')}>
            <TimeInput
              size={size}
              label={null}
              hourCycle={24}
              variant='underlined'
              onBlur={handleBlur}
              isDisabled={disabled}
              onFocusChange={setFocus}
              value={convertTime(timeStart) || null}
              aria-label={`${title || ''}_timeStart`}
              color={messageError ? 'danger' : 'primary'}
              onChange={(value: Time | null) => handleChange(value, true)}
              classNames={{
                input: ['text-[#1A1A1A]', styleInput[size]],
                inputWrapper: ['border-b-0 hover:border-b-0 after:h-0 pb-0 shadow-none px-0', classNameInputWrapper],
              }}
            />
            <span className={cn('px-1 text-[#1A1A1A] font-normal', size !== 'sm' && 'mt-1')}>~</span>
            <TimeInput
              size={size}
              label={null}
              hourCycle={24}
              variant='underlined'
              onBlur={handleBlur}
              onFocusChange={setFocus}
              isDisabled={disabled}
              aria-label={`${title || ''}_timeEnd`}
              value={convertTime(timeEnd) || null}
              color={messageError ? 'danger' : 'primary'}
              onChange={(value: Time | null) => handleChange(value, false)}
              classNames={{
                input: ['text-[#1A1A1A]', styleInput[size]],
                inputWrapper: ['border-b-0 hover:border-b-0 after:h-0 pb-0 shadow-none px-0', classNameInputWrapper],
              }}
            />
          </div>
          <div className='flex items-center'>
            <Icon icon='schedule' size={getSizeIcon[size]} className='text-[#59587E]' />
          </div>
        </div>
        {showBtnDelete && (timeStart || timeEnd) && (
          <div className='absolute right-[-2.5rem]'>
            <div
              aria-label='btn-delete-time'
              className={cn(
                'cursor-pointer rounded-full shadow-[rgba(99,99,99,0.2)0px_2px_8px_0px]',
                '!min-w-7 h-7 flex items-center justify-center',
              )}
              onClick={handleDelete}
            >
              <Icon icon='delete' size={16} className='text-[#757575]' />
            </div>
          </div>
        )}
      </div>
      <ErrorMessage className='mt-1' errorMessage={messageError} />
    </div>
  );
}
export default CmnTimeInput;
