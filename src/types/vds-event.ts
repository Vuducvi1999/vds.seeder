export enum VDSEventSourceType {
  Unknown = 0,
  Camera = 1,
  WindowService = 2,
  ThirdParty = 3,
}

export interface VDSEventData {
  eventTypeId?: string | null;
  laneCode: string;
  zoneCode?: string | null;
  sourceType: VDSEventSourceType;
  sourceReferenceId: string;
  imageUrl?: string | null;
  confidence?: number | null;
}
