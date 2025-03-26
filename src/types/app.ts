import React from 'react';

export type StringObject = Record<string, string>;

export interface DrawerItem {
  name: string;
  router: string;
  id?: string;
  submenu?: DrawerItem[];
}

export enum ENotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type NotificationType = {
  isShow: boolean;
  type: ENotificationType;
  title: string;
  content: string | React.ReactNode;
  duration: number;
  size?: string;
  onClose?: () => void;
};

export interface Route {
  name: string;
  router: string;
  id?: string;
  subRoutes?: Record<string, Route>;
}

export interface IBreadcrumb {
  name: string;
  router: string;
  id?: string;
  subRoutes?: Record<string, IBreadcrumb>;
}

export interface Option {
  key: string;
  label: string;
  description?: string;
}

export interface CheckboxOption {
  key: string;
  label: string;
  value: string;
}

export interface ITab {
  key: string;
  title: string;
  content?: React.ReactNode;
}

export interface ISearchCard {
  key: string;
  title: React.ReactNode | string;
  content?: React.ReactNode;
}
export type DateString = `${number}/${number}/${number}`;

export interface IDateRange {
  start: string;
  end: string;
}

export interface IDataCalender {
  total_trans_number: number;
  day: string;
  month: string;
  low_price: number;
  high_price: number;
}

export interface ICalendarPrice {
  day: string;
  month: string;
  year: string;
  price?: number;
}

export interface ISelectedDay {
  year: number;
  month: number;
  day: number;
}
