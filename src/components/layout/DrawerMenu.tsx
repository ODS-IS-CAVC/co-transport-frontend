'use client';
import { Button, Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@nextui-org/react';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

import { CARRIER_MENU, SHIPPER_MENU } from '@/constants/router/menu';
import { ROUTER, ROUTER_ID } from '@/constants/router/router';
import useHash from '@/hook/useHash';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { cn, convertRouterToDrawerItems } from '@/lib/utils';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';
import { DrawerItem } from '@/types/app';

import { Icon } from '../common/Icon';

export function DrawerMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const hash = useHash();
  const dispatch = useAppDispatch();
  const openDrawer = useAppSelector((state) => state.app.openDrawer);

  const [selected, setSelected] = useState('');
  const [drawers, setDrawers] = useState<DrawerItem[]>([]);
  const [isShowDrawer, setIsShowDrawer] = useState<boolean>(false);
  const [open, setOpen] = useState<number[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setIsShowDrawer(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getOpenIndexes = (items: DrawerItem[]): number[] => {
    const indexes: number[] = [];
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const hasSubmenu = item.submenu && item.submenu.length > 0;
      let path = pathname;
      if (pathname && pathname.includes(ROUTER.CARRIER)) {
        if (hash) {
          path += hash;
        } else {
          path += `#${ROUTER_ID.CARRIER_DASHBOARD_TRADING}`;
        }
      }
      if (pathname && pathname.includes(ROUTER.SHIPPER)) {
        if (hash) {
          path += hash;
        } else {
          path += `#${ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION}`;
        }
      }
      const routes = item.id ? `${item.router}#${item.id}` : item.router;
      if (routes === path) {
        indexes.push(index);
      }
      if (hasSubmenu && item.submenu && item.submenu.length > 0) {
        const childOpen = getOpenIndexes(item.submenu);
        if (childOpen.length > 0) {
          indexes.push(index);
        }
      }
    }
    return indexes;
  };

  useEffect(() => {
    if (pathname) {
      let path = pathname;
      if (pathname.includes(ROUTER.CARRIER)) {
        if (hash) {
          path += hash;
        } else {
          path += `#${ROUTER_ID.CARRIER_DASHBOARD_TRADING}`;
        }
      }
      if (pathname.includes(ROUTER.SHIPPER)) {
        if (hash) {
          path += hash;
        } else {
          path += `#${ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION}`;
        }
      }
      setSelected(path);
      if (pathname.includes(ROUTER.CARRIER)) {
        const carrierItems = convertRouterToDrawerItems(CARRIER_MENU);
        setDrawers(carrierItems);
        setOpen(getOpenIndexes(carrierItems));
      } else if (pathname.includes(ROUTER.SHIPPER)) {
        const shipperItems = convertRouterToDrawerItems(SHIPPER_MENU);
        setDrawers(shipperItems);
        setOpen(getOpenIndexes(shipperItems));
      }
    }
  }, [pathname, hash]);

  const renderMenu = (drawers: DrawerItem[]) => {
    return (
      <div className='w-full relative flex flex-col gap-0 bg-content1 max-w-full overflow-visible px-3 py-2'>
        <ul className='w-full flex flex-col gap-0.5 outline-none' aria-label='Menu'>
          {drawers.map((item, index) => {
            const isShowChild = open.includes(index);
            const checkSubmenuActive = item?.submenu?.filter((item) => item.router === selected);
            const routes = item.id ? `${item.router}#${item.id}` : item.router;
            return (
              <Fragment key={item.name + index}>
                <li
                  className={cn(
                    'flex items-center justify-between gap-2 p-3 rounded-md text-sm sm:text-base',
                    'font-medium hover:bg-primary hover:text-white cursor-pointer',
                    (checkSubmenuActive?.length ||
                      selected === routes ||
                      (selected.startsWith(routes) && item.submenu === undefined)) &&
                      'text-primary',
                  )}
                  onClick={() => {
                    if (item.submenu && item.submenu.length > 0) {
                      setOpen((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
                    } else {
                      router.push(routes);
                      dispatch(actions.appAction.setReloadMenu(item.id));
                    }
                  }}
                >
                  {item.name}
                  {item.submenu && item.submenu.length > 0 && (
                    <Icon icon={isShowChild ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={24} />
                  )}
                </li>
                {item.submenu && item.submenu.length > 0 && isShowChild && (
                  <div className='pl-3'>{renderMenu(item.submenu)}</div>
                )}
              </Fragment>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <>
      {isShowDrawer ? (
        <Drawer
          isOpen={openDrawer}
          hideCloseButton
          placement='left'
          size='xs'
          onOpenChange={() => dispatch(actions.appAction.toggleDrawer(!openDrawer))}
        >
          <DrawerContent>
            {(onClose) => (
              <>
                <DrawerHeader className='flex flex-col gap-1'>
                  <div className='flex items-center justify-between'>
                    <div>{gTxt('MENU.MENU')}</div>
                    <Button isIconOnly aria-label='notification' variant='light' onPress={onClose}>
                      <Icon icon='close' size={24} />
                    </Button>
                  </div>
                </DrawerHeader>
                <DrawerBody className='pt-4'>{renderMenu(drawers)}</DrawerBody>
              </>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <div className='w-72 overflow-y-auto sticky top-0 inset-x-0'>{renderMenu(drawers)}</div>
      )}
    </>
  );
}
