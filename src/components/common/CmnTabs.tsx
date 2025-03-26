import { Tab, Tabs } from '@nextui-org/react';

import { cn } from '@/lib/utils';
import { ITab } from '@/types/app';

interface CmnTabsProps {
  className?: string;
  items: ITab[];
  value?: string;
  onSelectionChange?: (key: string) => void;
}

export const CmnTabs = (props: CmnTabsProps) => {
  const { items, value, className, onSelectionChange = () => null } = props;

  return (
    <Tabs
      aria-label='Tabs'
      variant='underlined'
      color='primary'
      items={items}
      selectedKey={value}
      className={cn('w-full', className)}
      classNames={{
        tabList: 'gap-0 relative rounded-none p-0 bg-white',
        cursor: 'w-0',
        tab: 'max-w-fit pr-3 pl-0 pb-6 last:pr-0 h-16 transition-all',
        tabContent:
          'h-[3.5rem] px-3 pt-6 text-[#757575] text-base leading-6 font-bold border-b-[0.25rem] border-b-[#E8F1FE]' +
          ' tracking-wide group-data-[selected=true]:text-foreground group-data-[selected=true]:border-primary',
      }}
      onSelectionChange={(key) => onSelectionChange(key as string)}
    >
      {(item) => (
        <Tab key={item.key} title={item.title}>
          {item?.content}
        </Tab>
      )}
    </Tabs>
  );
};
