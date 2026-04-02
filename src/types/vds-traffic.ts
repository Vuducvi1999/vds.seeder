export enum TrafficIntervalType {
  Unknown = 0,
  OneMinute = 1,
  FiveMinutes = 5,
  FifteenMinutes = 15,
}

export interface VDSTrafficData {
  laneCode: string;
  zoneCode?: string;
  occurDate: string;
  intervalType: TrafficIntervalType;
  numVehicles: number;
  avgSpeed: number;
  occupancy: number;
  avgDensity?: number | null;
  avgHeadway?: number | null;
  confidence?: number | null;
}

