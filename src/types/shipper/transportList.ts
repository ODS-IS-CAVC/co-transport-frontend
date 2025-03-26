export interface TransportPlanItem {
  id: number;
  transport_code: string;
  transport_name: string;
  collection_date: string;
  collection_time_from: string;
  collection_time_to: string;
  departure_from: number;
  arrival_to: number;
  trailer_number: number | null;
  trailer_number_rest: number | null;
  price_per_unit: number;
  vehicle_condition: number[];
  temp_range: number[];
  cargo_info_id: number;
  company_name?: string | null;
  created_at: string;
  outer_package_code: number;
  total_length: number;
  total_width: number;
  total_height: number;
  weight: number;
  special_instructions: string | null;
  status: number | null;
  cns_line_item_by_date_id: number;
}

interface TransportPlan {
  company_name: string;
  created_at: string;
  transport_name: string;
  transport_code: string;
  departure_from: number;
  stopper: number | null;
  arrival_to: number;
  collection_date_from: string;
  collection_date_to: string;
  trailer_number: number;
  repeat_day: number;
  day_week: number[];
  collection_time_from: string;
  collection_time_to: string;
  price_per_unit: number;
  vehicle_condition: number[];
  outer_package_code: number;
  cargo_name: string;
  cargo_info_id: number;
  total_length: number;
  total_width: number;
  total_height: number;
  total_weight: number;
  special_instructions: string;
  origin_type?: number;
  import_id: number;
  is_private: boolean;
  id: number;
}

interface TransportPlanCargoInfo {
  price_per_unit: number;
  outer_package_code: number;
  cargo_info_id: number;
  cargo_name: string;
  total_length: number;
  total_width: number;
  total_height: number;
  total_weight: number;
  special_instructions: string;
  status: number;
  id: number;
  temp_range: number[];
  created_date: string;
}

export interface TransportInfo {
  transport_plan: TransportPlan;
  transport_plan_cargo_info: TransportPlanCargoInfo[];
  transport_plan_item: TransportPlanItem[];
}

export interface TransportInfoResponse {
  dataList: TransportInfo[];
  currentPage: number;
  totalPage: number;
  totalItem: number;
  itemPerPage: number;
  companyName: string;
}

export interface TransportPlanInfoRequest {
  transport_plan: TransportPlanRequest;
  transport_plan_cargo_info: TransportPlanCargoInfoRequest[];
  transport_plan_item: TransportPlanItemRequest[];
}

export interface DayWeek {
  [key: string]: {
    fromTime: string;
    toTime: string;
  };
}

export interface TransportPlanTime {
  date_from: string | null;
  date_to: string | null;
  time_from: string | null;
  time_to: string | null;
  repeat_day: number | null;
  day_week: DayWeek | null;
}

export interface TransportPlanRequest {
  transport_name?: string;
  transport_code?: string;
  departure_from: number | null;
  arrival_to: number | null;
  collection_date_from: string;
  collection_date_to: string;
  trailer_number: number | null;
  repeat_day: number;
  day_week: number[];
  collection_time_from: string;
  collection_time_to: string;
  price_per_unit: number | null;
  vehicle_condition: number[];
  origin_type?: number;
  import_id: number | null;
  is_private: boolean;
  id?: number;
}

export interface TransportPlanCargoInfoRequest {
  price_per_unit: number | null;
  outer_package_code: number | null;
  cargo_info_id: number | null;
  cargo_name: string;
  total_length: number | null;
  total_width: number | null;
  total_height: number | null;
  total_weight: number | null;
  special_instructions?: string;
  created_date?: string;
  temp_range: number[];
  id?: number;
}

export interface TransportPlanItemRequest {
  transport_name: string;
  transport_code: string;
  collection_date: string;
  collection_time_from: string;
  collection_time_to: string;
  departure_from?: number | null;
  arrival_to?: number | null;
  trailer_number?: number | null;
  trailer_number_rest?: number | null;
  price_per_unit?: number | null;
  cargo_info_id: number | null;
  cargo_name: string;
  temp_range: number[];
  outer_package_code?: number | null;
  total_length: number | null;
  total_width: number | null;
  total_height: number | null;
  weight: number | null;
  special_instructions?: string;
  status: number;
  id?: number;
}
