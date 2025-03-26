'use client';

import { Button, Input, InputProps } from '@nextui-org/react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface CmnInputSearchProps extends InputProps {
  classNameWrap?: string;
  onSearch?: (text: string) => void;
}

const CmnInputSearch = (props: CmnInputSearchProps) => {
  const { classNameWrap, onSearch = () => null, size = 'md', ...rest } = props;

  const [textSearch, setTextSearch] = useState('');

  const styleCustom = {
    sm: 'h-6 min-h-6 pl-2 pr-0', // 24px
    md: 'h-9 min-h-9 pl-2 pr-0', // 36px
    lg: 'h-14 min-h-14 pl-3 pr-0', // 56px
  };

  return (
    <div className={classNameWrap}>
      <Input
        size={size}
        value={textSearch}
        aria-label='CmnInputSearch'
        onChange={(e) => setTextSearch(e.target.value.trim())}
        endContent={
          <Button
            radius='none'
            onPress={() => onSearch(textSearch)}
            className={cn(
              'bg-[#0017C1] text-white min-w-14',
              size === 'sm' && 'h-[1.438rem]',
              size === 'md' && 'h-[2.188rem]',
              size === 'lg' && 'h-[3.438rem]',
            )}
          >
            検索
          </Button>
        }
        classNames={{
          input: [
            'placeholder:text-foreground !text-[#1E1E1E]',
            size === 'sm' && '!text-sm !font-normal !leading-[1.75] !tracking-[0.035rem]',
            size === 'md' && '!text-base !font-normal !leading-7 !tracking-[0.04rem]',
            size === 'lg' && '!text-base !font-normal !leading-[1.7] !tracking-[0.04rem]',
          ],
          inputWrapper: [
            'border-[#D9D9D9] focus-within:border-[#0017C1] overflow-hidden',
            'border border-1 rounded-lg !bg-white data-[hover=true]:!bg-white',
            styleCustom[size],
          ],
        }}
        {...rest}
      />
    </div>
  );
};

export default CmnInputSearch;
