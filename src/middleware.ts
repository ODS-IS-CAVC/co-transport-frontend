import { NextRequest, NextResponse } from 'next/server';

import { KEY_AUTHENTICATION_STORAGE, KEY_COOKIE_ROLE } from './constants/keyStorage';
import { ROUTER } from './constants/router/router';

const protectedRoutes = [ROUTER.CARRIER, ROUTER.SHIPPER];

export function middleware(req: NextRequest) {
  const isAuthentication = req.cookies.get(KEY_AUTHENTICATION_STORAGE)?.value || '';

  if (
    !isAuthentication &&
    (req.nextUrl.pathname === ROUTER.HOME_PAGE ||
      protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route)))
  ) {
    const url = new URL(ROUTER.LOGIN, req.url);
    return NextResponse.redirect(url);
  }

  if (isAuthentication) {
    const role = req.cookies.get(KEY_COOKIE_ROLE)?.value || '';
    const nextUrl = role === 'carrier' ? ROUTER.CARRIER : ROUTER.SHIPPER;
    if (
      req.nextUrl.pathname.startsWith(ROUTER.LOGIN) ||
      req.nextUrl.pathname.startsWith(ROUTER.LOGIN_FOR_TEST_URL) ||
      req.nextUrl.pathname === ROUTER.HOME_PAGE ||
      (req.nextUrl.pathname.startsWith(ROUTER.CARRIER) && role === 'shipper') ||
      (req.nextUrl.pathname.startsWith(ROUTER.SHIPPER) && role === 'carrier')
    ) {
      const url = new URL(nextUrl, req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
