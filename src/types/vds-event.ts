export enum VDSEventType {
  Unknown = 0,
  PpeDetection = 1,
  RestrictedArea = 2,
  AbnormalPresence = 3,
  IdentityManagement = 4,
  SafetyMonitoring = 5,
  HazardDetection = 6,
  CameraHealth = 7,
  Tracking = 8,
  SmartSearch = 9,
}

export enum VDSEventSourceType {
  Unknown = 0,
  Camera = 1,
  WindowService = 2,
  ThirdParty = 3,
}

export interface VDSEventData {
  id?: string;
  eventType: VDSEventType;
  location: string;
  sourceType: VDSEventSourceType;
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
