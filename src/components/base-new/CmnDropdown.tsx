import { Select, SelectItem, SelectProps } from '@nextui-org/react';

import ArrowDown from '@/icons/ArrowDown';
import { cn } from '@/lib/utils';
import { Option } from '@/types/app';

import Label from '../common/Label';

interface CmnDropdownProps extends Omit<SelectProps, 'children'> {
  title?: string;
  helpText?: string;
  value?: string;
  txtRequired?: string;
  classNameWrap?: string;
  classNameSelect?: string;
  required?: boolean;
  items: Option[];
  errorMessage?: string;
  name?: string; // React Hook Form
  register?: any; // React Hook Form
  rules?: object; // React Hook Form
}

function CmnDropdown(props: CmnDropdownProps) {
  const {
    title,
    helpText,
    classNameWrap,
    classNameSelect,
    txtRequired,
    disabled = false,
    required = false,
    items = [],
    errorMessage,
    size = 'lg',
    register,
    name,
    rules,
    ...rest
  } = props;

  const styleCustom = {
    sm: 'h-6 min-h-6 px-2', // 24px
    md: 'h-9 min-h-9 px-2', // 36px
    lg: 'h-14 min-h-14 px-3', // 56px
  };

  return (
    <div className={cn('w-full flex flex-col min-w-60', classNameWrap)}>
      {title && <Label title={title} required={required} txtRequired={txtRequired} />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mt-2'>{helpText}</p>}
      <Select
        {...(register ? register(name, rules) : {})} // React Hook Form
        aria-labelledby={title || helpText || 'Select'}
        size={size}
        radius='sm'
        variant='bordered'
        aria-label={title}
        labelPlacement='outside'
        selectorIcon={<ArrowDown color={disabled ? '#949494' : '#1A1A1A'} />}
        classNames={{
          value: [
            size === 'sm' && 'text-sm font-normal leading-[1.75] tracking-[0.035rem]',
            size === 'md' && '!text-base !font-normal !leading-7 !tracking-[0.04rem]',
            size === 'lg' && 'text-base font-normal leading-[1.7] tracking-[0.04rem]',
            disabled && '!text-[#949494]',
          ],
          trigger: [
            `${errorMessage ? 'border-1 border-error focus-within:border-error' : 'bg-white border border-[#1A1A1A]'}`,
            'focus-within:!border-warning focus-within:!border-2',
            'data-[open=true]:!border-warning data-[open=true]:!border-2',
            disabled && '!bg-[#F2F2F2] border-[#949494] pointer-events-none',
            (title || helpText) && 'mt-2',
            styleCustom[size],
            classNameSelect,
          ],
          selectorIcon: 'end-2',
        }}
        listboxProps={{
          itemClasses: {
            selectedIcon: 'hidden',
          },
        }}
        items={items}
        errorMessage={errorMessage}
        isInvalid={Boolean(errorMessage)}
        {...rest}
      >
        {(item: Option) => <SelectItem key={`${item.key}`}>{item.label}</SelectItem>}
      </Select>
    </div>
  );
}

export default CmnDropdown;
