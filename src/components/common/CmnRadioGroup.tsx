import { Radio, RadioGroup, RadioGroupProps } from '@nextui-org/react';

import { cn } from '@/lib/utils';
import { CheckboxOption } from '@/types/app';

import Label from './Label';

interface CmnRadioGroupProps extends RadioGroupProps {
  title: string;
  helpText?: string;
  classNameWrap?: string;
  classNameRadio?: string;
  option: CheckboxOption[];
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

function CmnRadioGroup(props: CmnRadioGroupProps) {
  const {
    title,
    helpText,
    errorMessage,
    classNameWrap,
    classNameRadio,
    required = false,
    option = [],
    orientation = 'horizontal',
    ...rest
  } = props;

  return (
    <div className={classNameWrap}>
      <Label title={title} required={required} />
      {helpText && <p className='text-[#757575] text-xs font-normal leading-[1.225rem] mt-2'>{helpText}</p>}
      <RadioGroup
        orientation={orientation}
        radius='sm'
        color='secondary'
        errorMessage={errorMessage}
        isInvalid={Boolean(errorMessage)}
        classNames={{
          wrapper: cn('mt-2', classNameRadio),
        }}
        {...rest}
      >
        {option.map((item, index) => (
          <Radio
            key={`${item?.key}_${index}`}
            value={item?.value}
            classNames={{
              wrapper: 'before:!border-foreground',
            }}
          >
            {item?.label || ''}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}

export default CmnRadioGroup;
