export interface VehicleInfo {
  images: string[];
  id: number;
  registration_area_code: string;
  registration_group_number: string;
  registration_character: string;
  registration_number_1: string;
  registration_number_2: string;
  vehicle_code: string;
  vehicle_name: string;
  vehicle_type: number;
  vehicle_size: number;
  temperature_range: number[];
  max_payload: number;
  total_length: number;
  total_width: number;
  total_height: number;
  ground_clearance: number;
  door_height: number;
  body_specification: string;
  body_shape: string;
  body_construction: string;
  status: number;
  delete_flag: number;
}

export interface VehicleNoAvailable {
  id: number;
  vehicle_info_id: number;
  start_date: string; // YYYYMMDD format
  end_date: string; // YYYYMMDD format
  status: number;
  day_week: number[];
}

export interface VehicleData {
  vehicle_info: VehicleInfo;
  vehicle_no_available: VehicleNoAvailable[];
}

export interface MessageErrors {
  vehicle_name: string;
  registration_area_code: string;
  registration_group_number: string;
  registration_character: string;
  registration_number_1: string;
  max_payload?: string;
  total_length?: string;
  total_width?: string;
  total_height?: string;
  ground_clearance?: string;
  door_height?: string;
}
