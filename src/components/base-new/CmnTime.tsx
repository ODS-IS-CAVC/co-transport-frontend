'use client';

import { Time } from '@internationalized/date';
import { Button, Select, SelectItem, SelectProps, TimeInput } from '@nextui-org/react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import ErrorMessage from '../common/ErrorMessage';
import { Icon } from '../common/Icon';
import Label from '../common/Label';
import { TimeString } from './CmnTimeInput';

interface CmnTimeProps extends Omit<SelectProps, 'children'> {
  title?: string;
  helpText?: string;
  value?: string;
  classNameWrap?: string;
  classNameSelect?: string;
  required?: boolean;
  errorMessage?: string;
  txtRequired?: string;
  defaultTime?: TimeString; // 11:00
  getValue?: (value: TimeString) => void;
  onChangeTime?: (value: TimeString) => void;
}

function CmnTime(props: CmnTimeProps) {
  const {
    title,
    helpText,
    classNameWrap,
    classNameSelect,
    disabled = false,
    required = false,
    errorMessage,
    size = 'md',
    defaultTime,
    txtRequired,
    getValue = () => null,
    onChangeTime,
    ...rest
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const [timeValue, setTimeValue] = useState<TimeString | undefined>();

  const [time, setTime] = useState<TimeString | undefined>(defaultTime);

  const getSizeIcon = {
    sm: 20,
    md: 26,
    lg: 30,
  };

  const styleCustom = {
    sm: 'h-6 min-h-6 px-2', // 24px
    md: 'h-9 min-h-9 px-2', // 36px
    lg: 'h-14 min-h-14 px-3', // 56px
  };

  const convertTime = (time: TimeString | undefined) => {
    if (!time) return;
    const [hours, minutes] = time.split(':').map(Number);
    return new Time(hours, minutes);
  };

  const handleChange = (value: Time | null) => {
    if (!value) return setTimeValue(undefined);
    const timeString = `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`;
    setTimeValue(timeString as TimeString);
  };

  const showTime = (time: TimeString) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours}時間${minutes}分`;
  };

  const handleClick = () => {
    setIsOpen(false);
    const valueTime = timeValue ? timeValue : time ? time : '00:00';
    setTime(valueTime);
    getValue(valueTime);
    onChangeTime && onChangeTime(valueTime);
  };

  return (
    <div className={cn('w-full flex flex-col min-w-40', classNameWrap)}>
      {title && <Label title={title} required={required} txtRequired={txtRequired} />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mt-2'>{helpText}</p>}

      <Select
        size={size}
        radius='sm'
        isOpen={isOpen}
        variant='bordered'
        selectionMode='multiple'
        placeholder={time ? showTime(time) : ''}
        aria-label={`${title || ''}_time_Select`}
        onOpenChange={(open) => open !== isOpen && setIsOpen(open)}
        renderValue={() => (time ? <p>{showTime(time)}</p> : <React.Fragment />)}
        selectorIcon={<Icon icon='schedule' size={getSizeIcon[size]} className='text-[#59587E]' />}
        listboxProps={{
          itemClasses: {
            selectedIcon: 'hidden',
          },
        }}
        classNames={{
          selectorIcon: [
            'text-[#59587E]',
            size === 'sm' && 'w-4 h-4 top-[0.125rem] data-[open=true]:!top-[20rem]',
            size === 'md' && 'end-2 w-6 h-6',
            size === 'lg' && 'w-8 h-8 end-2 top-3',
          ],
          trigger: [
            'bg-white border border-[#D9D9D9] focus-within:!border-warning focus-within:!border-2',
            'data-[open=true]:!border-warning data-[open=true]:!border-2 data-[open=true]:!h-2',
            disabled && '!bg-[#F2F2F2] pointer-events-none',
            errorMessage && '!border-error',
            (title || helpText) && 'mt-2',
            styleCustom[size],
          ],
          value: [
            '!text-foreground',
            size === 'sm' && '!text-sm !font-normal !leading-[1.75] !tracking-[0.035rem]',
            size === 'md' && '!text-base !font-normal !leading-[1.75] !tracking-[0.04rem]',
            size === 'lg' && '!text-base !font-normal !leading-[1.7] !tracking-[0.04rem]',
          ],
        }}
        {...rest}
      >
        <SelectItem
          key='1'
          textValue={time as string}
          className='p-0 rounded-none !bg-white hover:!bg-white cursor-default'
        >
          <span className='text-xs font-normal'>時間を選択</span>
          <div className='flex'>
            <div className='mx-auto'>
              <TimeInput
                label=''
                size='lg'
                radius='sm'
                hourCycle={24}
                granularity='minute'
                onChange={handleChange}
                aria-label={`${title}_time`}
                defaultValue={convertTime(time)}
                classNames={{
                  inputWrapper: 'mt-2 border-b-0 hover:border-b-0 after:h-0 w-[4.375rem]',
                }}
              />
            </div>
          </div>

          <div className='flex justify-between mt-4'>
            <Button
              size='sm'
              color='primary'
              variant='bordered'
              className='border-1 mr-2'
              onPress={() => setIsOpen(false)}
            >
              キャン
            </Button>
            <Button size='sm' color='primary' className='ml-2' onPress={handleClick}>
              OK
            </Button>
          </div>
        </SelectItem>
      </Select>
      <ErrorMessage errorMessage={errorMessage as string} className='mt-1' />
    </div>
  );
}

export default CmnTime;
