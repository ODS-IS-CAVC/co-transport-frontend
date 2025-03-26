import { gTxt } from '@/messages/gTxt';
import { DeliveryAbilityRequest, VehicleDiagramTrailerRequest } from '@/types/schedule';
import { TransportPlanInfoRequest, TransportPlanTime } from '@/types/shipper/transportList';

export interface PaginationConfig {
  current?: number | undefined;
  pageSize?: number | undefined;
  total?: number | undefined;
}

export const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 10,
  total: 0,
};

export const JAPANESE_HOLIDAYS: Record<string, Record<string, string>> = {
  '1': {
    '1': '元日',
    '8': '成人の日',
  },
  '2': {
    '11': '建国記念の日',
    '12': '振替休日',
    '23': '天皇誕生日',
  },
  '3': {
    '20': '春分の日',
  },
  '4': {
    '29': '昭和の日',
  },
  '5': {
    '3': '憲法記念日',
    '4': 'みどりの日',
    '5': 'こどもの日',
    '6': '振替休日',
  },
  '7': {
    '15': '海の日',
  },
  '8': {
    '11': '山の日',
    '12': '振替休日',
  },
  '9': {
    '16': '敬老の日',
    '22': '秋分の日',
    '23': '振替休日',
  },
  '10': {
    '14': 'スポーツの日',
  },
  '11': {
    '3': '文化の日',
    '4': '振替休日',
    '23': '勤労感謝の日',
  },
  '12': {
    '31': '大晦日',
  },
};

export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_CURRENT_PAGE = 1;

export const DEFAULT_TOTAL_PAGE = 0;

export const PAGE_LIST_SIZE = [
  {
    key: '5',
    label: '5件',
  },
  {
    key: '10',
    label: '10件',
  },
  {
    key: '20',
    label: '20件',
  },
  {
    key: '50',
    label: '50件',
  },
  {
    key: '100',
    label: '100件',
  },
];

export const VEHICLE_TYPE = {
  TRACTOR: 1,
  TRAILER: 2,
};

export const VEHICLE = [
  {
    key: '0',
    label: 'すべて',
    value: '0',
  },
  {
    key: '1',
    label: gTxt('COMMON.VEHICLE_TYPE_TRACTOR'),
    value: '1',
  },
  {
    key: '2',
    label: gTxt('COMMON.VEHICLE_TYPE_TRAILER'),
    value: '2',
  },
];

export const TEMPERATURE_RANGE = {
  0: '指定なし',
  1: 'ドライ',
};

export const TEMPERATURE_RANGE_LIST_CARGO = [
  {
    key: '0',
    label: TEMPERATURE_RANGE[0],
    value: '0',
  },
  {
    key: '1',
    label: TEMPERATURE_RANGE[1],
    value: '1',
  },
];

export const TEMPERATURE_RANGE_LIST = [
  {
    key: '0',
    label: 'すべて',
    value: '0',
  },
  {
    key: '1',
    label: TEMPERATURE_RANGE[1],
    value: '1',
  },
];

export const VEHICLE_UPDATE = [
  { key: '1', label: 'option 1', description: 'option 1' },
  { key: '2', label: 'option 2', description: 'option 2' },
];

export const COST_CALCULATION_VEHICLE_INFO = [
  // 原価計算用車両情報
  { key: '1', label: '指定なし', description: '指定なし' },
  { key: '2', label: '指定あり', description: '指定あり' },
];

export const VEHICLE_UNAVAILABLE_PERIOD = [
  // 車両使用不可期間
  { key: '1', label: '指定なし', description: '指定なし' },
  { key: '2', label: '指定あり', description: '指定あり' },
];

export const REPETITION = [
  {
    key: '0',
    value: '0',
    label: '繰り返しなし',
  },
  {
    key: '1',
    value: '1',
    label: '毎週繰り返し',
  },
  {
    key: '2',
    value: '2',
    label: '毎月繰り返し',
  },
  {
    key: '3',
    value: '3',
    label: '毎年繰り返し',
  },
];

export const STATUS_CARGO = {
  1: '輸送計画に登録済み',
  0: '輸送計画に未登録',
};

export const STATUS_CARGO_GROUP = [
  {
    key: '1',
    value: '1',
    label: '輸送計画登録済',
  },
  {
    key: '0',
    value: '0',
    label: '輸送計画未登録',
  },
];

export const OUTER_PACKAGE = [
  {
    key: '1',
    label: '飲料',
  },
  {
    key: '2',
    label: '製菓',
  },
  {
    key: '3',
    label: '食品',
  },
  {
    key: '4',
    label: '空缶',
  },
  {
    key: '5',
    label: '紙製品',
  },
  {
    key: '6',
    label: '化粧品',
  },
  {
    key: '7',
    label: '機械',
  },
  {
    key: '8',
    label: '工業製品',
  },
  {
    key: '9',
    label: '自動車部品',
  },
  {
    key: '10',
    label: '樹脂',
  },
  {
    key: '11',
    label: '日雑',
  },
];

export const FREIGHT_RATE = {
  COMMON: 0,
  DAILY: 1,
};

export const FREIGHT_RATE_TYPES = [
  { key: String(FREIGHT_RATE.COMMON), label: '共通運賃' },
  { key: String(FREIGHT_RATE.DAILY), label: '日別運賃' },
];

export const STATUS_TRANSPORT_INFO = {
  IN_PROGRESS: '1',
  MATCH_AVAILABLE: '2',
  MATCH_NOT_AVAILABLE: '3',
  PRIVATE: '4',
};

export const STATUS_TRANSPORT_INFO_LIST = [
  {
    key: '1',
    value: 'inprogress',
    label: '進行中',
  },
  {
    key: '2',
    value: 'match_available',
    label: 'マッチあり',
  },
  {
    key: '3',
    value: 'match_not_available',
    label: 'マッチなし',
  },
  {
    key: '4',
    value: 'private',
    label: '非公開',
  },
];

export const STATUS_TRANSPORT_INFO_FORM = [
  { key: '0', value: '0', label: '非公開' },
  { key: '1', value: '1', label: '公開中' },
];

export const CUT_OFF_TIMES = [
  { key: '1', label: '1時間前' },
  { key: '2', label: '2時間前' },
  { key: '3', label: '3時間前' },
  { key: '4', label: '4時間前' },
  { key: '5', label: '5時間前' },
];

export const TRADING_VIEW_MODE = [
  {
    key: '1',
    label: 'カレンダー',
  },
  {
    key: '2',
    label: 'リスト',
  },
];

export const INIT_CARGO_INFO_SHIPPER = {
  cargo_name: '',
  temp_range: [],
  special_instructions: '',
  status: 0,
};

export const INIT_DELIVERY_ABILITY: DeliveryAbilityRequest = {
  vehicle_diagram: {
    status: 0,
    trip_name: '',
    round_trip_type: 0,
    adjustment_price: {},
    day_week: {},
    cut_off_price: {},
  },
  start_date: '',
  end_date: '',
  status: 0,
  repeat_day: 0,
  is_round_trip: false,
  departure_from: null,
  arrival_to: null,
  is_validate: true,
};

export const INIT_VEHICLE_DIAGRAM_TRAILER_REQUEST: VehicleDiagramTrailerRequest = {
  trip_name: '',
  departure_time: '',
  arrival_time: '',
  cut_off_price: {},
  trailers: [],
};

export const INIT_TRANSPORT_PLAN_TIME: TransportPlanTime = {
  date_from: null,
  date_to: null,
  time_from: null,
  time_to: null,
  repeat_day: null,
  day_week: null,
};

export const INIT_TRANSPORT_PLAN_INFO_REQUEST: TransportPlanInfoRequest = {
  transport_plan: {
    transport_name: 'N/A',
    transport_code: 'N/A',
    departure_from: null,
    arrival_to: null,
    collection_date_from: '',
    collection_date_to: '',
    trailer_number: null,
    repeat_day: 0,
    day_week: [],
    collection_time_from: '',
    collection_time_to: '',
    price_per_unit: null,
    vehicle_condition: [],
    import_id: null,
    origin_type: 0,
    is_private: true,
  },
  transport_plan_cargo_info: [],
  transport_plan_item: [],
};

export enum TransType {
  SHIPPER = 0,
  CARRIER = 1,
}

export const ADVANCE_STATUS_LIST = [
  {
    key: '0',
    label: '予約',
    value: 'propose',
  },
  {
    key: '1',
    label: '契約',
    value: 'contract',
  },
  {
    key: '2',
    label: '運行決定',
    value: 'decisionTransport',
  },
  {
    key: '3',
    label: '運行',
    value: 'transport',
  },
  {
    key: '4',
    label: '決済',
    value: 'payment',
  },
  {
    key: '5',
    label: '取引完了',
    value: 'complete',
  },
];

export const TEMPLATE_CSV = {
  TRANSPORT_PLAN: 'templateTransportPlan.csv',
  DIAGRAM: 'templateDiagram.csv',
  VEHICLE: 'templateVehicle.csv',
  CARGO: 'templateCargo.csv',
};
