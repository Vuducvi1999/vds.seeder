export enum TrafficIntervalType {
  Unknown = 0,
  OneMinute = 1,
  FiveMinutes = 5,
  FifteenMinutes = 15,
}

export interface VDSTrafficData {
  laneCode: string;
  zoneCode?: string | null;
  occurDate: string;
  intervalType: TrafficIntervalType;
  numVehicles: number;
  avgSpeed: number;
  occupancy: number;
  avgDensity?: number | null;
  avgHeadway?: number | null;
  base64Image?: string | null;
  confidence?: number | null;
  imageUrl?: string | null;
}
