import { faker } from '@faker-js/faker';
import { VDSEventType, VDSEventSourceType, VDSEventData } from '@/types/vds-event';

export function generateVdsEventData(baseData: Partial<VDSEventData>, config: { fieldName: keyof VDSEventData; isAutoGenerate: boolean }[]): VDSEventData {
  const data: VDSEventData = {
    eventType: VDSEventType.PpeDetection,
    location: '',
    sourceType: VDSEventSourceType.Camera,
    imagePath: null,
    confidence: null,
    deviceId: faker.string.uuid(),
    occurDate: new Date().toISOString(),
    laneCode: '',
    ...baseData,
  };

  for (const cfg of config) {
    if (!cfg.isAutoGenerate) continue;

    switch (cfg.fieldName) {
      case 'eventType':
        data.eventType = faker.helpers.arrayElement(
          (Object.values(VDSEventType) as (VDSEventType | string)[]).filter((v): v is VDSEventType => typeof v === 'number')
        );
        break;
      case 'location':
        data.location = faker.location.streetAddress();
        break;
      case 'sourceType':
        data.sourceType = faker.helpers.arrayElement(
          (Object.values(VDSEventSourceType) as (VDSEventSourceType | string)[]).filter((v): v is VDSEventSourceType => typeof v === 'number')
        );
        break;
      case 'imagePath':
        data.imagePath = `images/${faker.string.alphanumeric(10)}.jpg`;
        break;
      case 'confidence':
        data.confidence = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
      case 'deviceId':
        data.deviceId = faker.string.uuid();
        break;
      case 'occurDate':
        data.occurDate = faker.date.recent({ days: 30 }).toISOString();
        break;
      case 'laneCode':
        data.laneCode = `LANE-${faker.string.numeric(2)}`;
        break;
    }
  }

  return data;
}

export function generateBatchData(
  count: number,
  baseData: Partial<VDSEventData>,
  configs: { fieldName: keyof VDSEventData; isAutoGenerate: boolean }[]
): VDSEventData[] {
  return Array.from({ length: count }, () => generateVdsEventData(baseData, configs));
}
