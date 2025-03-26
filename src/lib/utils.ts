import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { DATE_FORMAT, TIME_FORMAT } from '@/constants/constants';
import dayjs from '@/lib/dayjs';
import { gTxt } from '@/messages/gTxt';
import { DrawerItem, IBreadcrumb, Route } from '@/types/app';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBreadcrumbs = (
  pathname: string,
  id: string,
  routeConfig: Record<string, IBreadcrumb>,
): IBreadcrumb[] => {
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs: IBreadcrumb[] = [];
  let currentPath = '';
  let homePath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    if (index === 0) {
      homePath = currentPath;
    }
    const route = findRouteByPath(currentPath, id, routeConfig);
    if (route) {
      breadcrumbs.push({
        name: route.name,
        router: route?.router || '',
      });
    }
  });
  breadcrumbs.unshift({
    name: gTxt('MENU.HOME'),
    router: homePath,
  });
  return breadcrumbs;
};

// Function to find route by path
const findRouteByPath = (path: string | null, id: string, routeConfig: Record<string, IBreadcrumb>): Route | null => {
  if (!path) return null;

  for (const key in routeConfig) {
    const route = routeConfig[key];

    if (route.router === path) return route;

    if (route.subRoutes) {
      const subRoute = findRouteByPath(path, id, route.subRoutes);
      if (subRoute) return subRoute;
    }
  }
  return null;
};

/**
 * format number to currency. Example: 1000000.12345 => 1,000,000.12345
 * @param value
 */
export const formatCurrency = (value?: string) => {
  if (!value) return '';

  let numberString = value.replaceAll(',', '');
  const parts = numberString.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

export const convertCurrencyToNumber = (value: string) => {
  // Remove the non-numeric characters
  value = value.replace(/[^0-9.,]/g, '');
  if (!value) return undefined;
  const parts = value.split('.');
  parts[0] = parts[0].replaceAll(',', '');
  if (parts[1]) value = parts.join('.');
  value = parts[0];
  return Number(value);
};

export const convertRouterToDrawerItems = (routerConfig: Record<string, Route>): DrawerItem[] => {
  const items: DrawerItem[] = [];

  for (const key in routerConfig) {
    const route = routerConfig[key];
    const drawerItem: DrawerItem = {
      id: route.id,
      router: route?.router || '',
      name: route.name,
    };

    // Check for subRoutes and recursively convert them
    if (route.subRoutes) {
      drawerItem.submenu = convertRouterToDrawerItems(route.subRoutes);
    }

    items.push(drawerItem);
  }

  return items;
};

// format currency japanese (e.g: 123456 -> ￥123,456)
export function currencyFormatWithIcon(number: number): string {
  if (!number) return '0';

  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(number);
}

export const convertDateFormatPicker = (dateString: string, currentFormat: string): string => {
  return dayjs(dateString, currentFormat).format(DATE_FORMAT.YYYY_MM_DD);
};

export const convertDateFormatPickerYYYYMMDD = (dateString: string, currentFormat: string): string => {
  return dayjs(dateString, currentFormat).format(DATE_FORMAT.YYYYMMDD);
};

export const convertFormatDatePicker = (dateString: string | Date, newFormat: string): string => {
  return dayjs(dateString).format(newFormat);
};

export const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm '0' nếu cần
  const day = String(date.getDate()).padStart(2, '0'); // Thêm '0' nếu cần
  return `${year}${month}${day}`;
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date.toString() !== 'Invalid Date' && !isNaN(date.getTime());
};

export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path;
};

export const getCookie = (name: string): string | undefined => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return undefined;
};

export const getSearchString = (searchString: { [key: string]: string | string[] | undefined }): string => {
  const urlSearchParams = new URLSearchParams(
    Object.entries(searchString).flatMap(([key, value]) =>
      Array.isArray(value)
        ? value.map((v) => [key, v]).filter((pair) => pair[1] !== undefined)
        : value !== undefined
          ? [[key, value]]
          : [],
    ),
  );
  return urlSearchParams.toString();
};

export const objectToQueryParamsNoEncode = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null) // Bỏ qua null/undefined
    .flatMap(([key, value]) => (Array.isArray(value) ? value.map((v) => `${key}=${v}`) : `${key}=${value}`))
    .join('&');
};

export const objectToQueryParamsNoEncodeArray = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null) // Bỏ qua null/undefined
    .flatMap(([key, value]) => {
      return `${key}=${value}`;
    })
    .join('&');
};

export const formatTime = (time: string, currentFormat: string = TIME_FORMAT.HHMMSS) => {
  return dayjs(time, currentFormat).format(TIME_FORMAT.HH_MM);
};

export const formatTimeHHMM = (time: string, currentFormat: string = TIME_FORMAT.HHMMSS) => {
  return dayjs(time, currentFormat).format(TIME_FORMAT.HHMM);
};

export const isEmptyObject = (obj?: object) => {
  return obj && Object.keys(obj).length === 0;
};

export const isNullObject = (obj: Record<string, any>): boolean => Object.values(obj).every((value) => value === null);

// formatCutOffTime(1.5); -> "1時間30分前"
export const formatCutOffTime = (time?: number | undefined) => {
  if (!time) return 0;
  const hours = Math.floor(time);
  const minutes = (time % 1) * 60;
  return `${hours ? `${hours}時間` : ''}${minutes ? `${minutes}分` : ''}前`;
};

export const subtractHours = (time: string, hours: number) =>
  formatTimeHHMM(dayjs(time, TIME_FORMAT.HHMMSS).subtract(hours, 'hour').format(TIME_FORMAT.HHMMSS));
