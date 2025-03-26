'use client';
import { deleteCookie, setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import Notification from '@/components/common/Notification';
import NotificationMain from '@/components/common/NotificationMain';
import { BreadcrumbsHeader } from '@/components/layout/BreadcrumbsHeader';
import { DrawerMenu } from '@/components/layout/DrawerMenu';
import { Header } from '@/components/layout/Header';
import {
  KEY_AUTHENTICATION_STORAGE,
  KEY_COOKIE_COMPANY_ID,
  KEY_COOKIE_REFRESH_TOKEN,
  KEY_COOKIE_ROLE,
  KEY_COOKIE_TOKEN,
  KEY_COOKIE_USER_ID,
} from '@/constants/keyStorage';
import { ROUTER, ROUTER_ID } from '@/constants/router/router';
import useHash from '@/hook/useHash';
import { useAppDispatch, useAppSelector } from '@/hook/useRedux';
import { differenceExpired } from '@/lib/helper';
import { getCookie } from '@/lib/utils';
import { actions } from '@/redux';
import { RootState } from '@/redux/store';
import { authenticationApi } from '@/services/authentication/authentication';
import { commonCarrierService } from '@/services/carrier/common';

export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  const userToken = getCookie(KEY_COOKIE_TOKEN) || '';
  const userRefreshToken = getCookie(KEY_COOKIE_REFRESH_TOKEN) || '';
  const userRole = getCookie(KEY_COOKIE_ROLE) || '';

  const dispatch = useAppDispatch();
  const router = useRouter();
  const hash = useHash();
  const contentRef = useRef<HTMLDivElement>(null);

  const isAuthentication = useAppSelector((state: RootState) => state.auth.isAuthenticated);

  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    let interval: any;
    if (!isAuthentication) {
      return;
    }
    const secondDifferenceExpired = differenceExpired(userToken);
    if (secondDifferenceExpired < 60) {
      deleteCookie(KEY_COOKIE_TOKEN);
      authenticationApi
        .refreshTokens(userRefreshToken)
        .then((response) => {
          if (response.accessToken) {
            setCookie(KEY_COOKIE_TOKEN, response.accessToken);
          } else {
            logout();
          }
        })
        .catch((error) => {
          logout();
        });
    } else {
      interval = setInterval(
        () => {
          deleteCookie(KEY_COOKIE_TOKEN);
          authenticationApi
            .refreshTokens(userRefreshToken)
            .then((response) => {
              if (response.accessToken) {
                setCookie(KEY_COOKIE_TOKEN, response.accessToken);
              } else {
                logout();
              }
            })
            .catch((error) => {
              logout();
            })
            .finally(() => {
              clearInterval(interval);
            });
        },
        (secondDifferenceExpired - 60) * 1000,
      );
    }

    const logout = () => {
      deleteCookie(KEY_AUTHENTICATION_STORAGE);
      deleteCookie(KEY_COOKIE_TOKEN);
      deleteCookie(KEY_COOKIE_REFRESH_TOKEN);
      deleteCookie(KEY_COOKIE_ROLE);
      deleteCookie(KEY_COOKIE_COMPANY_ID);
      deleteCookie(KEY_COOKIE_USER_ID);
      dispatch(actions.authAction.logout());
      router.push(ROUTER.LOGIN);
    };

    return () => {
      interval && clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isAuthentication) {
      commonCarrierService()
        .getPrefectures()
        .then((response) => {
          dispatch(actions.appAction.setLocations(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [isAuthentication]);

  useEffect(() => {
    if (hash) {
      handleScroll();
    }
  }, [hash]);

  const handleScroll = () => {
    if (contentRef.current) {
      const scrollPosition = contentRef.current.scrollTop;
      let currentSection = '';
      const sections =
        userRole === 'carrier'
          ? [
              ROUTER_ID.CARRIER_DASHBOARD_TRADING,
              ROUTER_ID.CARRIER_DASHBOARD_CONFIRMATION,
              ROUTER_ID.CARRIER_DASHBOARD_NEGOTIATION,
              ROUTER_ID.CARRIER_VEHICLE_INFO_LIST,
              ROUTER_ID.CARRIER_SCHEDULE_LIST,
              ROUTER_ID.CARRIER_SHIPPING_REQUEST,
            ]
          : [
              ROUTER_ID.SHIPPER_DASHBOARD_NEGOTIATION,
              ROUTER_ID.SHIPPER_DASHBOARD_CONFIRMATION,
              ROUTER_ID.SHIPPER_DASHBOARD_TRADING,
              ROUTER_ID.SHIPPER_CARGO_INFO_LIST,
              ROUTER_ID.SHIPPER_TRANSPORT_INFO_LIST,
            ];
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;

          if (scrollPosition >= offsetTop - 200 && scrollPosition < offsetTop + offsetHeight) {
            currentSection = section;
          }
        }
      });

      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
        window.history.pushState(null, '', `#${currentSection}`);
      }
    }
  };

  return (
    <div className='relative flex flex-col max-w-screen-2xl min-w-96 mx-auto overflow-hidden h-[100vh]'>
      <Header />
      <NotificationMain />
      <Notification />
      <main
        className='light mt-4 pb-4 tl:flex overflow-auto scrollbar-hide scroll-smooth'
        ref={contentRef}
        onScroll={handleScroll}
      >
        <DrawerMenu />
        <div className='pl-4 tl:w-[calc(100%-18rem)]'>
          <BreadcrumbsHeader />
          <div className='mt-4'>{children}</div>
        </div>
      </main>
      <span className='hidden revisionHash'>{process.env.GIT_HASH}</span>
    </div>
  );
}
