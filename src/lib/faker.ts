import { faker } from '@faker-js/faker';
import { SeedRequestConfig } from '@/types/seeder';
import { VDSEventData, VDSEventSourceType } from '@/types/vds-event';
import { VDSTrafficData, TrafficIntervalType } from '@/types/vds-traffic';
import { VDSVehicleClass, VDSVehicleData, VDSVehicleDirection } from '@/types/vds-vehicle';

const VEHICLE_COLORS = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Yellow', 'Green', 'Orange', 'Brown'];
const PLATE_COLORS = ['White', 'Yellow', 'Blue', 'Red'];

function randomIsoDateWithinDays(daysBack: number) {
  return faker.date.recent({ days: daysBack }).toISOString();
}

function randomLicensePlate() {
  return `${faker.string.alpha({ length: 2, casing: 'upper' })}-${faker.string.numeric(5)}`;
}

function randomBoolean() {
  return faker.datatype.boolean();
}

export function generateVdsEventData(
  baseData: Partial<VDSEventData>,
  configs: SeedRequestConfig<VDSEventData>[]
): VDSEventData {
  const data: VDSEventData = {
    eventTypeId: null,
    laneCode: `LANE-${faker.string.numeric(2)}`,
    zoneCode: null,
    sourceType: VDSEventSourceType.Camera,
    sourceReferenceId: faker.string.uuid(),
    imageUrl: null,
    confidence: null,
    ...baseData,
  };

  for (const cfg of configs) {
    if (!cfg.isAutoGenerate) {
      continue;
    }

    switch (cfg.fieldName) {
      case 'eventTypeId':
        data.eventTypeId = faker.string.uuid();
        break;
      case 'laneCode':
        data.laneCode = `LANE-${faker.string.numeric(2)}`;
        break;
      case 'sourceType':
        data.sourceType = faker.helpers.arrayElement(
          (Object.values(VDSEventSourceType) as Array<VDSEventSourceType | string>).filter(
            (value): value is VDSEventSourceType => typeof value === 'number'
          )
        );
        break;
      case 'sourceReferenceId':
        data.sourceReferenceId = faker.string.uuid();
        break;
      case 'confidence':
        data.confidence = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
    }
  }

  return data;
}

export function generateVdsTrafficData(
  baseData: Partial<VDSTrafficData>,
  configs: SeedRequestConfig<VDSTrafficData>[]
): VDSTrafficData {
  const data: VDSTrafficData = {
    laneCode: `LANE-${faker.string.numeric(2)}`,
    zoneCode: null,
    occurDate: randomIsoDateWithinDays(7),
    intervalType: TrafficIntervalType.OneMinute,
    numVehicles: faker.number.int({ min: 1, max: 120 }),
    avgSpeed: faker.number.float({ min: 15, max: 100, fractionDigits: 2 }),
    occupancy: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    avgDensity: faker.number.float({ min: 0, max: 80, fractionDigits: 2 }),
    avgHeadway: faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 }),
    confidence: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    ...baseData,
  };

  for (const cfg of configs) {
    if (!cfg.isAutoGenerate) {
      continue;
    }

    switch (cfg.fieldName) {
      case 'laneCode':
        data.laneCode = `LANE-${faker.string.numeric(2)}`;
        break;
      case 'occurDate':
        data.occurDate = randomIsoDateWithinDays(7);
        break;
      case 'intervalType':
        data.intervalType = faker.helpers.arrayElement([
          TrafficIntervalType.OneMinute,
          TrafficIntervalType.FiveMinutes,
          TrafficIntervalType.FifteenMinutes,
        ]);
        break;
      case 'numVehicles':
        data.numVehicles = faker.number.int({ min: 1, max: 120 });
        break;
      case 'avgSpeed':
        data.avgSpeed = faker.number.float({ min: 15, max: 100, fractionDigits: 2 });
        break;
      case 'occupancy':
        data.occupancy = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
      case 'avgDensity':
        data.avgDensity = faker.number.float({ min: 0, max: 80, fractionDigits: 2 });
        break;
      case 'avgHeadway':
        data.avgHeadway = faker.number.float({ min: 0.5, max: 10, fractionDigits: 2 });
        break;
      case 'confidence':
        data.confidence = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
    }
  }

  return data;
}

export function generateVdsVehicleData(
  baseData: Partial<VDSVehicleData>,
  configs: SeedRequestConfig<VDSVehicleData>[]
): VDSVehicleData {
  const data: VDSVehicleData = {
    zoneCode: null,
    laneCode: `LANE-${faker.string.numeric(2)}`,
    occurDate: randomIsoDateWithinDays(7),
    sourceReferenceId: faker.string.uuid(),
    plate: randomLicensePlate(),
    vehicleClass: VDSVehicleClass.Car,
    speed: faker.number.float({ min: 10, max: 120, fractionDigits: 2 }),
    confidence: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    vehicleColor: faker.helpers.arrayElement(VEHICLE_COLORS),
    plateColor: faker.helpers.arrayElement(PLATE_COLORS),
    vehicleLength: faker.number.float({ min: 1.8, max: 18, fractionDigits: 2 }),
    direction: faker.helpers.arrayElement([VDSVehicleDirection.Forward, VDSVehicleDirection.Backward]),
    imageUrl: null,
    isImputed: false,
    isBookmark: false,
    confidenceColor: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    confidenceSpeed: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    confidenceDirection: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    ...baseData,
  };

  for (const cfg of configs) {
    if (!cfg.isAutoGenerate) {
      continue;
    }

    switch (cfg.fieldName) {
      case 'laneCode':
        data.laneCode = `LANE-${faker.string.numeric(2)}`;
        break;
      case 'occurDate':
        data.occurDate = randomIsoDateWithinDays(7);
        break;
      case 'sourceReferenceId':
        data.sourceReferenceId = faker.string.uuid();
        break;
      case 'plate':
        data.plate = randomLicensePlate();
        break;
      case 'vehicleClass':
        data.vehicleClass = faker.helpers.arrayElement([
          VDSVehicleClass.Car,
          VDSVehicleClass.Truck,
          VDSVehicleClass.Bus,
          VDSVehicleClass.Motorbike,
        ]);
        break;
      case 'speed':
        data.speed = faker.number.float({ min: 10, max: 120, fractionDigits: 2 });
        break;
      case 'confidence':
        data.confidence = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
      case 'vehicleColor':
        data.vehicleColor = faker.helpers.arrayElement(VEHICLE_COLORS);
        break;
      case 'plateColor':
        data.plateColor = faker.helpers.arrayElement(PLATE_COLORS);
        break;
      case 'vehicleLength':
        data.vehicleLength = faker.number.float({ min: 1.8, max: 18, fractionDigits: 2 });
        break;
      case 'direction':
        data.direction = faker.helpers.arrayElement([VDSVehicleDirection.Forward, VDSVehicleDirection.Backward]);
        break;
      case 'isImputed':
        data.isImputed = randomBoolean();
        break;
      case 'isBookmark':
        data.isBookmark = randomBoolean();
        break;
      case 'confidenceColor':
        data.confidenceColor = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
      case 'confidenceSpeed':
        data.confidenceSpeed = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
      case 'confidenceDirection':
        data.confidenceDirection = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        break;
    }
  }

  return data;
}

export function generateVdsEventBatchData(
  count: number,
  baseData: Partial<VDSEventData>,
  configs: SeedRequestConfig<VDSEventData>[]
): VDSEventData[] {
  return Array.from({ length: count }, () => generateVdsEventData(baseData, configs));
}

export function generateVdsTrafficBatchData(
  count: number,
  baseData: Partial<VDSTrafficData>,
  configs: SeedRequestConfig<VDSTrafficData>[]
): VDSTrafficData[] {
  return Array.from({ length: count }, () => generateVdsTrafficData(baseData, configs));
}

export function generateVdsVehicleBatchData(
  count: number,
  baseData: Partial<VDSVehicleData>,
  configs: SeedRequestConfig<VDSVehicleData>[]
): VDSVehicleData[] {
  return Array.from({ length: count }, () => generateVdsVehicleData(baseData, configs));
}
