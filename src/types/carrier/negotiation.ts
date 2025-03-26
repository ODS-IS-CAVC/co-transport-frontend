import { VehicleDiagramAllocation, VehicleTripItemTrailer } from '../schedule';

export enum statusVehicleDiagram {
  NORMAL = 0,
  ERROR = 1,
  FINISH = 2,
}

export interface VehicleDiagramItemTracking {
  operation_date: string; // YYYYMMDD format
  operation_time: string; // HHMMSS format
  status: statusVehicleDiagram;
  label: string;
  message: string;
}

export interface VehicleDiagramData {
  id: number;
  operator_id: string;
  vehicle_diagram_id: number | null;
  day: string;
  trip_name: string;
  departure_time: string;
  arrival_time: string;
  price: number | null;
  departure_from: number;
  arrival_to: number;
  vehicle_diagram_item_tracking: VehicleDiagramItemTracking[];
  vehicle_diagram_item_trailer: VehicleTripItemTrailer[];
  vehicle_diagram_allocations: VehicleDiagramAllocation[];
}
