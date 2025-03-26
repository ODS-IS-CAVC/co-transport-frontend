import { Button, Pagination, PaginationItemRenderProps, PaginationItemType } from '@nextui-org/react';
import { useEffect, useMemo, useState } from 'react';

import dayjs from '@/lib/dayjs';
import { cn } from '@/lib/utils';

import { Icon } from '../../../common/Icon';

export interface ItemMonthPage {
  month: number;
  year: number;
  monthStr: string;
}

interface CmnMonthPaginationProps {
  currentMonth: Date;
  className?: string;
  listMonth: ItemMonthPage[];
  onPageChange: (month: number) => void;
}

export const CmnMonthPagination = (props: CmnMonthPaginationProps) => {
  const { currentMonth, listMonth, className, onPageChange } = props;

  const currentPage = useMemo(() => {
    const _date = dayjs(currentMonth);
    const _year = _date.year();

    const _month = _date.month();

    // const monthStr = `${_year}年${_month + 1}月`;
    const index = listMonth.findIndex((item) => item.month === _month + 1 && item.year === _year);
    return index + 1;
  }, [currentMonth, listMonth]);

  const [isFirstPage, setIsFirstPage] = useState(currentPage === 1);
  const [isLastPage, setIsLastPage] = useState(currentPage === listMonth.length);

  useEffect(() => {
    setIsFirstPage(currentPage === 1);
    setIsLastPage(currentPage === listMonth.length);
  }, [currentPage]);

  const styleButton = 'hover:bg-[#264AF4] hover:text-white text-[#5A5A5A] cursor-pointer rounded w-8 h-8';

  const renderItem = ({ key, value, isActive, setPage }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <li key={key} aria-label='next page'>
          <Button
            isIconOnly
            variant='light'
            onPress={() => currentPage < listMonth.length && setPage(currentPage + 1)}
            disabled={isLastPage}
            className={cn(styleButton, { 'pointer-events-none': isLastPage })}
            aria-label='btn-first-page'
          >
            <Icon icon='keyboard_arrow_right' size={24} className='text-current' />
          </Button>
        </li>
      );
    }

    if (value === PaginationItemType.PREV) {
      return (
        <li key={key} aria-label='previous page'>
          <Button
            isIconOnly
            variant='light'
            disabled={isFirstPage}
            onPress={() => currentPage > 1 && setPage(currentPage - 1)}
            className={cn(styleButton, { 'pointer-events-none': isFirstPage })}
          >
            <Icon icon='keyboard_arrow_left' size={24} className='text-current' />
          </Button>
        </li>
      );
    }

    if (value === PaginationItemType.DOTS) {
      return <li key={key}>...</li>;
    }

    return (
      <li key={key} aria-label={`page ${key}`} className='text-xs leading-[1.125rem]'>
        <Button
          className={cn(
            'font-medium text-xs leading-[1.125rem] hover:!bg-background rounded',
            isActive ? 'text-[#1E1E1E]' : 'text-[#00118F] underline',
            { 'pointer-events-none': value === currentPage },
          )}
          variant='light'
          onPress={() => setPage(value)}
        >
          {listMonth[value - 1].monthStr}
        </Button>
      </li>
    );
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className='flex items-center'>
        <Button
          isIconOnly
          aria-label='btn-first-page'
          disabled={isFirstPage}
          variant='light'
          onPress={() => !isFirstPage && onPageChange(1)}
          className={cn(styleButton, { 'pointer-events-none': isFirstPage })}
        >
          <Icon icon='first_page' size={24} className='text-current' />
        </Button>
        <Pagination
          page={currentPage}
          disableCursorAnimation
          showControls
          className='gap-2'
          initialPage={1}
          renderItem={renderItem}
          total={listMonth.length}
          variant='light'
          onChange={onPageChange}
        />
        <Button
          isIconOnly
          aria-label='btn-last-page'
          variant='light'
          disabled={isLastPage}
          className={cn(styleButton, { 'pointer-events-none': isLastPage })}
          onPress={() => !isLastPage && onPageChange(listMonth.length)}
        >
          <Icon icon='last_page' size={24} className='text-current' />
        </Button>
      </div>
    </div>
  );
};
