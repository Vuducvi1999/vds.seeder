export enum VDSEventType {
  PPEDetection = 'PPEDetection',
  RestrictedArea = 'RestrictedArea',
  HazardDetection = 'HazardDetection',
  VehicleDetection = 'VehicleDetection',
  PedestrianDetection = 'PedestrianDetection',
  TrafficViolation = 'TrafficViolation',
  AnomalyDetection = 'AnomalyDetection',
}

export enum VDSEventSourceType {
  Camera = 'Camera',
  ThirdParty = 'ThirdParty',
  Sensor = 'Sensor',
  Manual = 'Manual',
}

export interface VDSEventData {
  id?: string;
  eventType: VDSEventType | '';
  location: string;
  sourceType: VDSEventSourceType | '';
  imagePath: string | null;
  confidence: number | null;
  deviceId: string;
  occurDate: string;
  laneCode: string;
}

export interface SeedingConfig {
  fieldName: keyof VDSEventData;
  isAutoGenerate: boolean;
  fixedValue?: unknown;
}

export interface SeedRequest {
  count: number;
  batchSize: number;
  configs: SeedingConfig[];
  baseData: Partial<VDSEventData>;
}
