import { Checkbox, CheckboxGroup, CheckboxGroupProps } from '@nextui-org/react';

import { CheckboxOption } from '@/types/app';

import Label from '../common/Label';

interface CmnCheckboxGroupProps extends CheckboxGroupProps {
  title?: string;
  helpText?: string;
  txtRequired?: string;
  classNameWrap?: string;
  option: CheckboxOption[];
  disabled?: boolean;
  required?: boolean;
  classNameCheckbox?: { [key: string]: string | undefined };
}

function CmnCheckboxGroup(props: CmnCheckboxGroupProps) {
  const {
    title,
    helpText,
    txtRequired,
    errorMessage,
    classNameWrap,
    classNameCheckbox = {},
    required = false,
    disabled = false,
    option = [],
    orientation = 'horizontal',
    size = 'md',
    ...rest
  } = props;
  return (
    <div className={classNameWrap}>
      {title && <Label title={title} required={required} txtRequired={txtRequired} />}
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mt-2'>{helpText}</p>}
      <CheckboxGroup
        size={size}
        radius='none'
        orientation={orientation}
        classNames={{
          wrapper: [(title || helpText) && 'mt-2'],
        }}
        errorMessage={errorMessage}
        isInvalid={Boolean(errorMessage)}
        {...rest}
      >
        {option.map((item, index) => (
          <Checkbox
            key={`${item?.key}_${index}`}
            value={item?.value}
            classNames={{
              base: [
                size === 'sm' && 'mr-2',
                size === 'md' && 'mr-4',
                size === 'lg' && 'mr-6',
                disabled && '!pointer-events-none',
              ],
              wrapper: [
                '!rounded-[2px] ',
                size === 'sm' && 'mr-2',
                size === 'md' && 'mr-4',
                size === 'lg' && 'mr-6',
                errorMessage ? 'before:!border-error' : 'before:!border-foreground',
                disabled && 'before:!border-[#D9D9D9]',
              ],
              icon: 'before:border-1',
              ...classNameCheckbox,
            }}
          >
            <span className='text-foreground'>{item?.label || ''}</span>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
}

export default CmnCheckboxGroup;
