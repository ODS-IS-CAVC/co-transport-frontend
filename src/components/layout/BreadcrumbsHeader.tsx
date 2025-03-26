'use client';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { BREADCRUMBS } from '@/constants/router/breadcrumbs';
import useHash from '@/hook/useHash';
import { getBreadcrumbs } from '@/lib/utils';
import { IBreadcrumb } from '@/types/app';

import { Icon } from '../common/Icon';

export function BreadcrumbsHeader() {
  const pathname = usePathname();
  const hash = useHash();
  const [listBreadcrumbs, setListBreadcrumbs] = useState<IBreadcrumb[]>([]);

  useEffect(() => {
    if (pathname) {
      setListBreadcrumbs(getBreadcrumbs(pathname, hash.replace('#', ''), BREADCRUMBS));
    }
  }, [pathname]);

  return (
    <Breadcrumbs
      color='primary'
      radius='none'
      itemClasses={{
        separator: 'px-0 flex justify-end font-medium',
      }}
      separator={<Icon icon='chevron_right' size={20} />}
    >
      {listBreadcrumbs.map((item, index) => {
        return (
          <BreadcrumbItem key={index} href={item.router} className='bg-white'>
            <div className='text-xs font-medium leading-[1.5] text-primary px-5 py-2 hover:bg-default underline underline-offset-2'>
              {item.name}
            </div>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumbs>
  );
}
