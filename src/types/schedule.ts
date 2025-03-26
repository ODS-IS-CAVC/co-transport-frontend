import { VehicleInfo } from './carrier/vehicle';

export interface DeliveryAbilityResponse {
  dataList: DeliveryAbility[];
  currentPage: number;
  itemPerPage: number;
  totalItem: number;
  totalPage: number;
}

export interface VehicleDiagramAllocation {
  vehicle_info: VehicleInfo;
  vehicle_type: number;
  display_order: number;
  assign_type: number;
  id: number | null;
}

export interface DayTrailer {
  day: string;
  vehicle_diagram_item_id: number;
  vehicle_diagram_item_trailer_id: number | null;
  price: number;
  status: number;
}

export interface VehicleDiagramItemTrailer {
  vehicle_diagram_allocation_id: number;
  freight_rate_type: number;
  days: DayTrailer[];
}

export interface VehicleDiagramItem {
  id: number;
  operator_id: string;
  vehicle_diagram_id: number;
  day: string;
  trip_name: string;
  departure_time: string;
  arrival_time: string;
  price: number;
}

export interface DayWeek {
  [key: string]: {
    fromTime: string;
    toTime: string;
  };
}

export interface AdjustmentPrice {
  [key: string]: {
    price: number;
    adjustment: number;
  };
}

export interface CutOffPrice {
  [key: string]: number | undefined;
}

export interface dataPrivate {
  vehicle_diagram_item_trailer_id: number[];
  is_private: boolean;
}

export interface DeliveryAbility {
  id: number;
  operator_id: string;
  diagram_head_id: number;
  round_trip_type: number;
  trip_name: string;
  departure_from: number;
  stopper: number;
  arrival_to: number;
  departure_time: string;
  arrival_time: string;
  day_week: DayWeek;
  adjustment_price: AdjustmentPrice;
  common_price: number;
  cut_off_price: CutOffPrice;
  status: number;
  one_way_time: string;
  start_date: string;
  end_date: string;
  repeat_day: number;
  trailer_number: number;
  is_round_trip: boolean;
  origin_type: number;
  import_id: number;
  created_at: string;
  created_date: string;
  updated_at: string;
  vehicle_diagram_items: VehicleDiagramItem[];
  vehicle_diagram_allocations: VehicleDiagramAllocation[];
  vehicle_diagram_item_trailers: VehicleDiagramItemTrailer[];
}

interface VehicleDiagram {
  round_trip_type?: number | null;
  trip_name: string;
  departure_from?: number | null;
  stopper?: number | null;
  arrival_to?: number | null;
  departure_time?: string | null;
  arrival_time?: string | null;
  day_week: DayWeek;
  adjustment_price: AdjustmentPrice;
  common_price?: number | null;
  cut_off_price: CutOffPrice;
  status: number;
  id?: number;
}

export interface DeliveryAbilityRequest {
  is_validate: boolean;
  departure_from: number | null;
  stopper?: number | null;
  arrival_to: number | null;
  one_way_time?: string | null;
  start_date: string;
  end_date: string;
  repeat_day?: number | null;
  trailer_number?: number | null;
  is_round_trip?: boolean | null;
  origin_type?: number | null;
  import_id?: number | null;
  status: number;
  id?: number;
  vehicle_diagram: VehicleDiagram;
}

export interface DeliveryAbilityVehicleRequest {
  id: number | null;
  vehicle_info_id: number;
  vehicle_type: number;
  display_order: number;
  assign_type: number;
}

export interface VehicleDiagramTrailerRequest {
  trip_name: string;
  departure_time: string;
  arrival_time: string;
  cut_off_price: CutOffPrice;
  trailers: VehicleDiagramItemTrailer[];
}

export interface VehicleTripItemTrailer {
  id: number;
  vehicle_diagram_allocation_id: number;
  freight_rate_type: number;
  day: string;
  trip_name: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  status: number;
  cut_off_price: CutOffPrice;
  mobility_hub_id: number | null;
  valid_from: string;
  valid_until: string;
  matching_count: number;
  matching_status: string;
  order_status: string;
  order_id?: number;
  trans_order_id: number;
  display_order: number;
  total_count: string;
  trans_type: number;
  cut_off_fee: number;
  cut_off_time: number;
  carrier_operator_id: string;
}

export interface DataFlightListItem {
  id: number;
  day: string;
  created_date: string;
  cutoff_time: string;
  trip_name: string;
  departure_time: string;
  one_way_time: string;
  arrival_time: string;
  status: number;
  start_date: string;
  end_date: string;
  repeat_day: number;
  trailer_number: number;
  is_round_trip: boolean;
  origin_type: number;
  import_id: number;
  is_private: boolean;
  departure_from: number;
  arrival_to: number;
  stopper: number;
  vehicle_diagram_allocations: VehicleDiagramAllocation[];
  vehicle_diagram_item_trailer: VehicleTripItemTrailer[];
}

export interface FlightListResponse {
  totalItem: number;
  itemPerPage: number;
  currentPage: number;
  totalPage: number;
  dataList: DataFlightListItem[];
}
