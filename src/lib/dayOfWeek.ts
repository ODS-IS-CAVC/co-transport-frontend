import { CheckboxOption } from '@/types/app';

export type DayOfWeekKey = 7 | 1 | 2 | 3 | 4 | 5 | 6;
export type DayOfWeekValue = '日' | '月' | '火' | '水' | '木' | '金' | '土';

export const DAY_OF_WEEK: Record<DayOfWeekKey, DayOfWeekValue> = {
  7: '日',
  1: '月',
  2: '火',
  3: '水',
  4: '木',
  5: '金',
  6: '土',
};

export const WEEKDAYS: DayOfWeekValue[] = [
  DAY_OF_WEEK[7],
  DAY_OF_WEEK[1],
  DAY_OF_WEEK[2],
  DAY_OF_WEEK[3],
  DAY_OF_WEEK[4],
  DAY_OF_WEEK[5],
  DAY_OF_WEEK[6],
];

export const LST_CHECKBOX_WEEKDAYS: CheckboxOption[] = Object.entries(DAY_OF_WEEK).map(([key, value]) => ({
  key: key,
  label: value,
  value: key,
}));

export const WEEKDAYS_START_MONDAY: DayOfWeekValue[] = [
  DAY_OF_WEEK[1],
  DAY_OF_WEEK[2],
  DAY_OF_WEEK[3],
  DAY_OF_WEEK[4],
  DAY_OF_WEEK[5],
  DAY_OF_WEEK[6],
  DAY_OF_WEEK[7],
];

export const LST_CHECKBOX_WEEKDAYS_START_MONDAY: CheckboxOption[] = [
  {
    key: '1',
    label: DAY_OF_WEEK[1],
    value: '1',
  },
  {
    key: '2',
    label: DAY_OF_WEEK[2],
    value: '2',
  },
  {
    key: '3',
    label: DAY_OF_WEEK[3],
    value: '3',
  },
  {
    key: '4',
    label: DAY_OF_WEEK[4],
    value: '4',
  },
  {
    key: '5',
    label: DAY_OF_WEEK[5],
    value: '5',
  },
  {
    key: '6',
    label: DAY_OF_WEEK[6],
    value: '6',
  },
  {
    key: '7',
    label: DAY_OF_WEEK[7],
    value: '7',
  },
];

export const DAY_OF_WEEK_LIST_CHECKBOX = LST_CHECKBOX_WEEKDAYS_START_MONDAY.map((item) => ({
  ...item,
  label: `${item.label}曜日`,
}));
