'use client';

import { Input, InputProps } from '@nextui-org/react';

import Label from '../common/Label';

interface CmnInputProps extends InputProps {
  title?: string;
  helpText?: string;
  classNameWrap?: string;
  classNameInput?: string;
  valueDefault?: string;
  required?: boolean;
  disabled?: boolean;
  txtRequired?: string;
  name?: string; // React Hook Form
  register?: any; // React Hook Form
  rules?: object; // React Hook Form
}

const CmnInput = (props: CmnInputProps) => {
  const {
    title,
    helpText,
    classNameWrap,
    classNameInput,
    valueDefault,
    errorMessage,
    required = false,
    disabled = false,
    register,
    name,
    rules,
    size = 'md',
    txtRequired,
    ...rest
  } = props;

  const styleCustom = {
    sm: 'h-6 min-h-6 px-2', // 24px
    md: 'h-9 min-h-9 px-2', // 36px
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
        errorMessage={errorMessage}
        isInvalid={Boolean(errorMessage)}
        classNames={{
          input: [
            'placeholder:text-foreground !text-[#1E1E1E]',
            size === 'sm' && '!text-sm !font-normal !leading-[1.75] !tracking-[0.035rem]',
            size === 'md' && '!text-base !font-normal !leading-7 !tracking-[0.04rem]',
            size === 'lg' && '!text-base !font-normal !leading-[1.7] !tracking-[0.04rem]',
          ],
          inputWrapper: [
            `${errorMessage ? 'border-[#EC0000] focus-within:border-[#EC0000]' : 'border-[#D9D9D9] focus-within:border-[#0017C1]'}`,
            `border border-1 rounded-lg !bg-white data-[hover=true]:!bg-white ${classNameInput}`,
            disabled && 'pointer-events-none',
            (title || helpText) && 'mt-2',
            styleCustom[size],
          ],
        }}
        value={valueDefault}
        {...rest}
      />
    </div>
  );
};

export default CmnInput;
