import { VehicleDiagramAllocation } from '@/types/schedule';

import { TEMPERATURE_RANGE_LIST } from './common';

export const SORT_TYPE = [
  {
    key: '0',
    action: 'departureTime&order=asc',
    label: '出発時間(早い順)',
  },
  {
    key: '1',
    action: 'departureTime&order=desc',
    label: '出発時間(遅い順)',
  },
  {
    key: '2',
    action: 'tripName&order=asc',
    label: '便名(A-Z)',
  },
  {
    key: '3',
    action: 'tripName&order=desc',
    label: '便名(Z-A)',
  },
];

export const TEMPERATURE_RANGE = TEMPERATURE_RANGE_LIST.slice(1);

export const INIT_SCHEDULE_VEHICLE_INFO_LIST: Partial<VehicleDiagramAllocation>[] = [
  {
    id: null,
    vehicle_type: 1,
    display_order: 1,
  },
  {
    id: null,
    vehicle_type: 2,
    display_order: 2,
  },
  {
    id: null,
    vehicle_type: 2,
    display_order: 3,
  },
];

export const TRIP_TYPE_OPTIONS = [
  { key: '1', label: '往復' },
  { key: '2', label: '片道' },
];

export const FREQUENCY_OPTIONS = [
  { key: '0', label: '毎週' },
  // { key: '1', label: '隔週' },
  // { key: '2', label: '第1週' },
];

export const FILTER_FLIGHT_LIST = [
  {
    key: '4',
    label: 'マッチング',
    value: '1',
  },
  {
    key: '5',
    label: '提案/予約',
    value: '121',
  },
  {
    key: '6',
    label: '契約',
    value: '130,131,140,230,231,240',
  },
  {
    key: '7',
    label: '決済',
    value: '150,250',
  },
  {
    key: '8',
    label: '運行',
    value: '160,260',
  },
  {
    key: '9',
    label: '取引完了',
    value: '161,261',
  },
];
