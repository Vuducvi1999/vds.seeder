export enum VDSVehicleClass {
  Unknown = 0,
  Car = 1,
  Truck = 2,
  Bus = 3,
  Motorbike = 4,
}

export enum VDSVehicleDirection {
  Forward = 0,
  Backward = 1,
}

export interface VDSVehicleData {
  zoneCode?: string | null;
  laneCode: string;
  occurDate: string;
  sourceReferenceId: string;
  plate: string;
  vehicleClass?: VDSVehicleClass | null;
  speed?: number | null;
  confidence?: number | null;
  vehicleColor?: string | null;
  plateColor?: string | null;
  vehicleLength?: number | null;
  direction?: VDSVehicleDirection | null;
  imageUrl?: string | null;
  isImputed?: boolean | null;
  isBookmark?: boolean | null;
  confidenceColor?: number | null;
  confidenceSpeed?: number | null;
  confidenceDirection?: number | null;
}
