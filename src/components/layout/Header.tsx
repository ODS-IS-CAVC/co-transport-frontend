'use client';

import { Badge, Button, Navbar, NavbarBrand, NavbarContent, NavbarMenuToggle } from '@nextui-org/react';
import { deleteCookie } from 'cookies-next';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  KEY_AUTHENTICATION_STORAGE,
  KEY_COOKIE_COMPANY_ID,
  KEY_COOKIE_REFRESH_TOKEN,
  KEY_COOKIE_ROLE,
  KEY_COOKIE_TOKEN,
  KEY_COOKIE_USER_ID,
} from '@/constants/keyStorage';
import { ROUTER } from '@/constants/router/router';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { gTxt } from '@/messages/gTxt';
import { actions } from '@/redux';

import { Icon } from '../common/Icon';
import { Logo } from './Logo';
import { ProfileMenu } from './ProfileMenu';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userInfo = useAppSelector((state) => state.auth.userInfo);
  const openDrawer = useAppSelector((state) => state.app.openDrawer);
  const [screenName, setScreenName] = useState('');

  useEffect(() => {
    if (pathname) {
      if (pathname.includes(ROUTER.CARRIER)) {
        setScreenName(gTxt('MENU.CARRIER.HOME'));
      } else if (pathname.includes(ROUTER.SHIPPER)) {
        setScreenName(gTxt('MENU.SHIPPER.HOME'));
      } else {
        setScreenName('');
      }
    } else {
      setScreenName('');
    }
  }, [pathname]);

  const handleLogout = () => {
    deleteCookie(KEY_AUTHENTICATION_STORAGE);
    deleteCookie(KEY_COOKIE_TOKEN);
    deleteCookie(KEY_COOKIE_REFRESH_TOKEN);
    deleteCookie(KEY_COOKIE_ROLE);
    deleteCookie(KEY_COOKIE_COMPANY_ID);
    deleteCookie(KEY_COOKIE_USER_ID);
    dispatch(actions.authAction.logout());
    router.push(ROUTER.LOGIN);
  };

  const showDrawer = (show: boolean) => {
    dispatch(actions.appAction.toggleDrawer(show));
  };

  return (
    <Navbar
      className='bg-white border-b border-primary h-[5.5rem]'
      isBordered
      isBlurred={false}
      isMenuOpen={openDrawer}
      maxWidth='2xl'
      onMenuOpenChange={showDrawer}
    >
      <NavbarContent className='tl:hidden' justify='start'>
        <NavbarMenuToggle
          aria-label={openDrawer ? 'Close menu' : 'Open menu'}
          icon={<Icon icon={openDrawer ? 'close' : 'menu'} size={24} />}
        />
      </NavbarContent>
      <NavbarContent className='hidden tl:flex' justify='center'>
        <NavbarBrand>
          <Logo />
          <p className='font-normal text-gray-500 text-3xl'>{screenName}</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent as='div' className='items-center' justify='center'></NavbarContent>
      <NavbarContent as='div' className='items-center' justify='end'>
        {isAuthenticated ? (
          <>
            {userInfo && (
              <>
                <Button isIconOnly aria-label='notification' variant='light'>
                  <Badge color='danger' content='' shape='circle'>
                    <Icon icon='info' size={24} />
                  </Badge>
                </Button>
                <ProfileMenu userInfo={userInfo} actionLogout={handleLogout} />
              </>
            )}
            <Button variant='bordered' size='lg' radius='sm' color='primary' onPress={handleLogout}>
              <span>{gTxt('COMMON.BTN_LOGOUT')}</span>
            </Button>
          </>
        ) : (
          <Button size='lg' radius='sm' color='primary' onPress={() => router.push(ROUTER.LOGIN)}>
            {gTxt('COMMON.BTN_LOGIN')}
          </Button>
        )}
      </NavbarContent>
    </Navbar>
  );
}
