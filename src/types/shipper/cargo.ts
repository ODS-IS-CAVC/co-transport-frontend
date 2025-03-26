import { IListResponse } from '../response';

export interface CargoInfo {
  id: number;
  cargo_name: string;
  outer_package_code: number;
  total_length: number;
  total_width: number;
  total_height: number;
  weight: number;
  temp_range: number[];
  special_instructions: string;
  import_id: number;
  status: number;
  created_date: string;
  company_name?: string;
}

export interface CargoInfoForm {
  id?: string;
  cargo_name: string;
  transport_plan_id?: number;
  outer_package_code?: number;
  total_length?: number | null;
  total_width?: number | null;
  total_height?: number | null;
  weight?: number | null;
  temp_range?: number[];
  special_instructions?: string;
  status: number;
}

export interface CargoInfoResponse extends IListResponse<CargoInfo> {
  dataList: CargoInfo[];
  companyName: string;
}
