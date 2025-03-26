export interface ITradingItem {
  id: string; // Unique ID for the item
  date: string; // Date of the trip (e.g., "2024-11-07")
  departmentName: string; // Name of the department (e.g., "沼津01便")
  departureStation: string; // Departure station (e.g., "駿河湾沼津")
  departureTime: string; // Departure time (e.g., "06:20")
  departureVehicleType: string; // Type of vehicle (e.g., "ドライ")
  departureVehicleDetails: string; // Details of the vehicle (e.g., "沼津 100 あ 56-56 トレクストレーラ")
  departureMatchingStatus: string; // Matching status (e.g., "マッチングなし")
  arrivalStation: string; // Arrival station (e.g., "浜松")
  arrivalTime: string; // Arrival time (e.g., "07:49")
  cutOffTime: string; // Cut-off time (e.g., "03:20-05:20")
  arrivalVehicleType: string; // Type of vehicle (e.g., "ドライ")
  arrivalVehicleDetails: string; // Details of the vehicle (e.g., "沼津 100 あ 56-56 トレクストレーラ")
  arrivalMatchingStatus: string; // Matching status (e.g., "マッチングなし")
  departureCost: number; // Transportation cost (e.g., 49000)
  arrivalCost: number; // Transportation cost (e.g., 49000)
}
