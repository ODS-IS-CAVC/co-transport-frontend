'use client';
import { Textarea, TextAreaProps } from '@nextui-org/react';
import { useState } from 'react';
import { UseFormClearErrors } from 'react-hook-form';

import { cn } from '@/lib/utils';

import ErrorMessage from '../common/ErrorMessage';
import Label from '../common/Label';

interface CmnTextareaProps extends TextAreaProps {
  title?: string;
  helpText?: string;
  txtRequired?: string;
  classNameWrap?: string;
  maxRows?: number;
  maxLength?: number;
  required?: boolean;
  onValueChange?: (value: string) => void;

  name?: string; // React Hook Form
  register?: any; // React Hook Form
  rules?: object; // React Hook Form
  clearErrors?: UseFormClearErrors<any>; // React Hook Form
}

function CmnTextarea(props: CmnTextareaProps) {
  const {
    title,
    helpText,
    classNameWrap,
    maxLength,
    required = false,
    disabled = false,
    defaultValue = '',
    errorMessage,
    onValueChange = () => null,
    txtRequired,
    register,
    name,
    rules,
    clearErrors,
    ...rest
  } = props;

  const [value, setValue] = useState(defaultValue);

  const handleChange = (inputValue: string) => {
    setValue(inputValue);
    clearErrors && clearErrors(name);
    onValueChange(inputValue);
  };

  return (
    <div className={classNameWrap}>
      {title && <Label title={title} required={required} txtRequired={txtRequired} />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mt-2'>{helpText}</p>}
      <Textarea
        {...(register ? register(name, rules) : {})} // React Hook Form
        value={value}
        isInvalid={Boolean(errorMessage)}
        onChange={(e) => handleChange(e.target.value)}
        classNames={{
          input: 'placeholder:text-foreground resize-y !text-black min-h-[7.5rem]',
          inputWrapper: [
            'border border-1 rounded-lg !bg-white border-[#1A1A1A] focus-within:border-2 focus-within:!border-warning',
            disabled && '!bg-[#F2F2F2] border-[#949494] pointer-events-none',
            (title || helpText) && 'mt-2',
            Boolean(errorMessage) && 'border-[#EC0000] focus-within:border-[#EC0000]',
          ],
        }}
        {...rest}
      />

      <div className='flex items-start justify-between mt-[0.375rem]'>
        <div>
          <ErrorMessage errorMessage={errorMessage as string} />
        </div>

        {maxLength && (
          <p
            className={cn(
              'min-w-fit text-[#666666] font-normal text-xs leading-[1.313rem] ml-4',
              errorMessage && '!text-error',
            )}
          >
            {value?.length} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

export default CmnTextarea;
