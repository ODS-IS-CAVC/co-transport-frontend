'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import { useRef, useState } from 'react';

import ArrowDown from '@/icons/ArrowDown';
import { cn } from '@/lib/utils';
import { Option } from '@/types/app';

interface CmnFetchAutoCompleteProps {
  items: Option[];
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  selected?: string;
  placeholder?: string;
  width?: string;
  classNameWrap?: string;
  fetchMoreData: () => void;
  onChange: (value: string) => void;
}

export default function CmnFetchAutoComplete(props: CmnFetchAutoCompleteProps) {
  const {
    isLoading = false,
    disabled = false,
    items = [],
    size = 'md',
    placeholder,
    selected,
    onChange,
    fetchMoreData,
    classNameWrap,
    width = 'w-52',
  } = props;

  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        // Call API to fetch more data
        fetchMoreData();
      }
    }
  };

  const styleCustom = {
    sm: 'h-6 min-h-6 px-2', // 24px
    md: 'h-9 min-h-9 px-2', // 36px
    lg: 'h-14 min-h-14 px-3', // 56px
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} offset={10} placement='bottom'>
      <PopoverTrigger>
        <div
          className={cn(
            'flex items-center justify-between shadow-sm border-1 border-[#1A1A1A] rounded-lg cursor-pointer',
            disabled && '!bg-[#F2F2F2] border-[#949494] pointer-events-none',
            isOpen && 'border-warning border-2',
            width,
            styleCustom[size],
            classNameWrap,
          )}
        >
          <div
            className={cn(
              'truncate',
              !selected && 'text-default-400',
              size === 'sm' && 'text-sm font-normal leading-[1.75] tracking-[0.035rem]',
              size === 'md' && '!text-base !font-normal !leading-7 !tracking-[0.04rem]',
              size === 'lg' && 'text-base font-normal leading-[1.7] tracking-[0.04rem]',
            )}
          >
            {items.find((item) => item?.key === selected)?.label || placeholder}
          </div>
          <ArrowDown className={isOpen ? 'rotate-180' : ''} size='16px' />
        </div>
      </PopoverTrigger>
      <PopoverContent className={cn('flex flex-col justify-between overflow-hidden', width)}>
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className='my-2 flex flex-col gap-1 overflow-auto max-h-[300px] w-full'
        >
          {items.map((item, index) => (
            <div
              title={item?.label}
              key={`${item.key}_${index}`}
              onClick={() => {
                setIsOpen(false);
                onChange(item?.key);
              }}
              className={cn(
                'cursor-pointer hover:bg-default-200 px-2 py-2 rounded-lg',
                selected === item?.key && 'bg-default-200',
              )}
            >
              {item?.label}
            </div>
          ))}
        </div>
        {isLoading && <p className='text-[#626264] font-normal text-sm pb-2'>loading...</p>}
      </PopoverContent>
    </Popover>
  );
}
