import { Tab, Tabs } from '@nextui-org/react';

import { cn } from '@/lib/utils';
import { ISearchCard } from '@/types/app';

interface CmnTabsProps {
  className?: string;
  items: ISearchCard[];
  value?: string;
  onSelectionChange?: (key: string) => void;
}

export const CmnSelectableCard = (props: CmnTabsProps) => {
  const { items, value, className, onSelectionChange = () => null } = props;

  return (
    <Tabs
      aria-label='Tabs'
      items={items}
      selectedKey={value}
      className={cn('w-full', className)}
      classNames={{
        tabList: 'gap-0 relative rounded-none p-0 bg-white w-full',
        cursor: 'w-0',
        tab: 'px-0 pl-0 last:pr-0 h-[4.5rem] transition-all border-none',
        tabContent:
          'h-[4.5rem] w-full text-[#757575] text-base flex items-center justify-center leading-6 font-bold border rounded-tl-lg rounded-tr-lg tracking-wide ' +
          'border-b-primary group-data-[selected=true]:text-foreground group-data-[selected=true]:border-primary group-data-[selected=true]:border-b-0',
      }}
      onSelectionChange={(key) => onSelectionChange(key as string)}
    >
      {(item) => (
        <Tab
          key={item.key}
          title={item.title}
          className='border border-b-primary border-l-primary border-r-primary border-t-0 gap-0'
        >
          {value === item.key && item?.content}
        </Tab>
      )}
    </Tabs>
  );
};
