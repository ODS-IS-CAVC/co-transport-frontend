import { Autocomplete, AutocompleteItem, AutocompleteProps } from '@nextui-org/react';

import ArrowDown from '@/icons/ArrowDown';
import { cn } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { Option } from '@/types/app';

import Label from '../common/Label';

interface CmnAutocompleteProps extends Omit<AutocompleteProps<Option>, 'children'> {
  title?: string;
  helpText?: string;
  txtRequired?: string;
  classNameWrap?: string;
  required?: boolean;
  options: Option[];
}

function CmnAutocomplete(props: CmnAutocompleteProps) {
  const {
    title,
    helpText,
    txtRequired,
    classNameWrap,
    required = false,
    disabled = false,
    options = [],
    errorMessage,
    size = 'lg',
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
      <Autocomplete
        size={size}
        aria-label={title}
        defaultItems={options as Option[]}
        errorMessage={errorMessage}
        isInvalid={Boolean(errorMessage)}
        listboxProps={{
          emptyContent: gTxt('COMMON.LABEL_PLEASE_SELECT'),
        }}
        selectorIcon={<ArrowDown color={disabled ? '#949494' : '#1A1A1A'} />}
        inputProps={{
          classNames: {
            input: [
              size === 'sm' && 'text-sm font-normal leading-[1.75] tracking-[0.035rem]',
              size === 'md' && 'text-base font-normal leading-[1.75] tracking-[0.04rem]',
              size === 'lg' && 'text-base font-normal leading-[1.7] tracking-[0.04rem]',
            ],
            inputWrapper: [
              'border border-1 rounded-lg !bg-white w-full border-[#1A1A1A] focus-within:!border-warning focus-within:!border-2 bg-error',
              disabled && '!bg-[#F2F2F2] border-[#949494] pointer-events-none',
              (title || helpText) && 'mt-2',
              styleCustom[size],
            ],
          },
        }}
        {...rest}
      >
        {(item: Option) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
      </Autocomplete>
    </div>
  );
}

export default CmnAutocomplete;
