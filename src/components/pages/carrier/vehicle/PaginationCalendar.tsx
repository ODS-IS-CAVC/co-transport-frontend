import { Button, Pagination, PaginationItemRenderProps, PaginationItemType } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/common/Icon';
import { cn } from '@/lib/utils';

interface PaginationProps {
  totalPage: number;
  currentPage: number;
  className?: string;
  onPageChange: (page: number) => void;
}

export const PaginationCalendar = (props: PaginationProps) => {
  const { totalPage = 1, currentPage = 1, className, onPageChange } = props;

  const [isFirstPage, setIsFirstPage] = useState(currentPage === 1);
  const [isLastPage, setIsLastPage] = useState(currentPage === totalPage);

  useEffect(() => {
    setIsFirstPage(currentPage === 1);
    setIsLastPage(currentPage === totalPage);
  }, [currentPage]);

  const styleButton = 'hover:bg-[#264AF4] hover:text-white text-[#5A5A5A] cursor-pointer rounded w-8 h-8';

  const renderItem = ({ key, value, isActive, setPage }: PaginationItemRenderProps) => {
    if (value === PaginationItemType.NEXT) {
      return (
        <li key={key} aria-label='next page'>
          <Button
            isIconOnly
            variant='light'
            onPress={() => currentPage < totalPage && setPage(currentPage + 1)}
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
          {(() => {
            const currentDate = dayjs();
            const targetDate = currentDate.add(value - 1, 'month');
            const month = targetDate.format('M').padStart(2, '0');
            return `${targetDate.year()}年${month}月`;
          })()}
        </Button>
      </li>
    );
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className='flex items-center'>
        <Button
          isIconOnly
          variant='light'
          disabled={isFirstPage}
          aria-label='btn-first-page'
          onPress={() => !isFirstPage && onPageChange(1)}
          className={cn(styleButton, { 'pointer-events-none': isFirstPage })}
        >
          <Icon icon='first_page' size={24} className='text-current' />
        </Button>
        <Pagination
          showControls
          initialPage={1}
          variant='light'
          className='gap-2'
          total={totalPage}
          page={currentPage}
          disableCursorAnimation
          renderItem={renderItem}
          onChange={onPageChange}
        />
        <Button
          isIconOnly
          variant='light'
          disabled={isLastPage}
          aria-label='btn-last-page'
          onPress={() => !isLastPage && onPageChange(totalPage)}
          className={cn(styleButton, { 'pointer-events-none': isLastPage })}
        >
          <Icon icon='last_page' size={24} className='text-current' />
        </Button>
      </div>
    </div>
  );
};
