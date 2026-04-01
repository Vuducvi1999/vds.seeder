import { faker } from '@faker-js/faker';
import { VDSEventSourceType, VDSEventData } from '@/types/vds-event';

export function generateVdsEventData(baseData: Partial<VDSEventData>, config: { fieldName: keyof VDSEventData; isAutoGenerate: boolean }[]): VDSEventData {
  const data: VDSEventData = {
    eventTypeId: null,
    vdsDeviceId: faker.string.uuid(),
    laneCode: `LANE-${faker.string.numeric(2)}`,
    nodeId: faker.string.uuid(),
    zoneCode: undefined,
    sourceType: VDSEventSourceType.Camera,
    sourceReferenceId: faker.string.uuid(),
    imageUrl: null,
    confidence: null,
    ...baseData,
  };

  for (const cfg of config) {
    if (!cfg.isAutoGenerate) continue;

    switch (cfg.fieldName) {
      case 'eventTypeId':
        data.eventTypeId = faker.string.uuid();
        break;
      case 'vdsDeviceId':
        data.vdsDeviceId = faker.string.uuid();
        break;
      case 'laneCode':
        data.laneCode = `LANE-${faker.string.numeric(2)}`;
        break;
      case 'nodeId':
        data.nodeId = faker.string.uuid();
        break;
      case 'zoneCode':
        data.zoneCode = `ZONE-${faker.string.alphanumeric(4).toUpperCase()}`;
        break;
      case 'sourceType':
        data.sourceType = faker.helpers.arrayElement(
          (Object.values(VDSEventSourceType) as (VDSEventSourceType | string)[]).filter((v): v is VDSEventSourceType => typeof v === 'number')
        );
        break;
      case 'sourceReferenceId':
        data.sourceReferenceId = faker.string.uuid();
        break;
      case 'imageUrl':
        data.imageUrl = `https://cdn.example.com/images/${faker.string.alphanumeric(10)}.jpg`;
        break;
      case 'confidence':
        data.confidence = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
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
