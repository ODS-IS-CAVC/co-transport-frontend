'use client';
import { Input, InputProps } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { UseFormClearErrors, UseFormSetValue } from 'react-hook-form';

import { handleFormatNumberInput } from '@/lib/helper';

import Label from '../common/Label';

interface CmnInputNumberProps extends InputProps {
  title?: string;
  helpText?: string;
  txtRequired?: string;
  classNameWrap?: string;
  valueDefault?: number;
  isPrice?: boolean;
  disabled?: boolean;
  required?: boolean;
  isCurrency?: boolean;

  name?: string; // React Hook Form
  register?: any; // React Hook Form
  rules?: object; // React Hook Form
  setValue?: UseFormSetValue<any>; // React Hook Form
  clearErrors?: UseFormClearErrors<any>; // React Hook Form
}

const CmnInputNumber = (props: CmnInputNumberProps) => {
  const {
    title,
    helpText,
    classNameWrap,
    errorMessage,
    isPrice = false,
    disabled = false,
    required = false,
    isCurrency = false,
    valueDefault,
    register,
    name,
    rules,
    clearErrors,
    setValue,
    size = 'md',
    txtRequired,
    ...rest
  } = props;
  const [valueInput, setValueInput] = useState(
    valueDefault ? (isCurrency ? `${handleFormatNumberInput(String(valueDefault))} 円` : String(valueDefault)) : '',
  );

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (typeof valueDefault === 'number') {
      setValueInput(String(valueDefault));
    } else {
      setValueInput('');
    }
  }, [valueDefault]);

  const handleBlur = () => {
    handleUpdateEditing(false);
  };

  const handleUpdateEditing = (status: boolean) => {
    setIsEditing(status);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValueInput(newValue);
    clearErrors && clearErrors(name);
    setValue && setValue(name as string, newValue ? Number(newValue) : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isPrice && (e.key === '-' || e.key === '.')) {
      e.preventDefault();
    }
  };

  const styleCustom = {
    sm: 'h-6 min-h-6 px-2', // 24px
    md: 'h-[2.375rem] min-h-[2.375rem] px-2', // 38px
    lg: 'h-14 min-h-14 px-3', // 56px
  };

  return (
    <div className={classNameWrap}>
      {title && <Label title={title} required={required} txtRequired={txtRequired} />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mt-2'>{helpText}</p>}
      <Input
        {...(register ? register(name, rules) : {})} // React Hook Form
        size={size}
        aria-label={title}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        errorMessage={errorMessage}
        isInvalid={Boolean(errorMessage)}
        type={isEditing ? 'number' : 'text'}
        onFocus={() => handleUpdateEditing(true)}
        value={
          isEditing
            ? valueInput
            : isCurrency
              ? `${handleFormatNumberInput(valueInput)} 円`
              : handleFormatNumberInput(valueInput)
        }
        onChange={handleChange}
        classNames={{
          input: [
            'placeholder:text-foreground',
            size === 'sm' && '!text-sm !font-normal !leading-[1.75] !tracking-[0.035rem]',
            size === 'md' && '!text-base !font-normal !leading-[1.75] !tracking-[0.04rem]',
            size === 'lg' && '!text-base !font-normal !leading-[1.7] !tracking-[0.04rem]',
          ],
          inputWrapper: [
            `${errorMessage ? 'border-[#EC0000] focus-within:border-[#EC0000]' : 'border-[#D9D9D9] focus-within:border-[#0017C1]'}`,
            'border border-1 rounded-lg !bg-white data-[hover=true]:!bg-white',
            disabled && 'pointer-events-none',
            (title || helpText) && 'mt-2',
            styleCustom[size],
          ],
        }}
        {...rest}
      />
    </div>
  );
};

export default CmnInputNumber;
