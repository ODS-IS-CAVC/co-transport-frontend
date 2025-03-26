import { IDetailTransaction } from '../carrier/transactionInfo';

export type ITransactionShipperOrder = {
  data: {
    id: number;
  };
};

export interface ITransactionShipper {
  id: number;
  trailerNumber: number;
  trans_type: number;
  carrier_operator_id: string;
  carrier_operator_code: string;
  shipper_operator_id: number;
  shipper_operator_code: number;
  carrier2_operator_id: string;
  carrier2_operator_code: string;
  shipper_operator_name: string;
  carrier_operator_name: string;
  req_cns_line_item_id: number;
  cns_line_item_id: number;
  cns_line_item_by_date_id: number;
  vehicle_avb_resource_id: number;
  vehicle_avb_resource_item_id: number;
  departure_from: number;
  arrival_to: number;
  transport_date: string;
  request_price: number;
  propose_price: number;
  shipper_contract_file: string;
  carrier_contract_file: string;
  carrier2_contract_file: string;
  contract_file: string;
  status: number;
  request_snapshot: {
    id: number;
    status: number;
    weight: number | null;
    arrival_to: number;
    trans_type: number;
    operator_id: string;
    total_width: number | null;
    total_height: number | null;
    total_length: number | null;
    operator_code: string | null;
    departure_from: number;
    price_per_unit: number;
    trailer_number: number;
    trans_order_id: string | null;
    transport_code: string;
    transport_name: string;
    collection_date: string;
    cns_line_item_id: number | null;
    transport_plan_id: number | null;
    vehicle_condition: string | null;
    collection_time_to: string;
    outer_package_code: number;
    trailer_number_rest: number;
    collection_time_from: string;
    req_cns_line_item_id: number | null;
    special_instructions: string | null;
    temperature_range: [];
  };
  propose_snapshot: {
    id: number;
    day: [number, number, number];
    giai: string | null;
    price: number;
    status: number;
    trip_name: string;
    arrival_to: number;
    assign_type: string | null;
    max_payload: number | null;
    operator_id: string;
    total_width: number;
    arrival_time: [number, number];
    total_height: number;
    total_length: number;
    vehicle_size: string | null;
    vehicle_type: string | null;
    display_order: number | null;
    operator_code: string | null;
    departure_from: number;
    adjustment_price: number | null;
    temperature_range: [];
    departure_time_max: string | null;
    departure_time_min: string | null;
    vehicle_diagram_id: string | null;
    vehicle_avb_resource_id: string | null;
    car_max_load_capacity1_meas: string | null;
  };
  created_user: string;
  created_date: string;
  updated_user: string;
  updated_date: string;
  item_name_txt: string;
  trsp_cli_prty_name_txt: string;
  propose_arrival_time: string;
  propose_departure_time: string;
  request_collection_time_to: string;
  request_collection_time_from: string;
  cnsg_prty_name_txt: string;
  total?: number;
  sibling_order_status: number;
}

export type CombinedTransactionDetail = Omit<ITransactionShipper, keyof IDetailTransaction> & IDetailTransaction;

export type ParamTransactionMatching = {
  id: number;
  negotiation: {
    arrival_date: string;
    departure_date: string;
    cut_off_time: number;
    cut_off_fee: number;
    price: number;
  };
  cid: string;
  shipper_code: string;
  carrier_code: string;
  isNotIX: boolean;
};

export type CutOffInfoType = {
  id: number;
  operatorId: string;
  vehicleAvbResourceId: number;
  cutOffTime: number;
  cutOffFee: number;
  created_user: string;
  created_date: string;
  updated_user: string;
  updated_date: string;
};
