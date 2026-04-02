import { apiService } from '@/lib/api';
import {
  generateVdsEventBatchData,
  generateVdsTrafficBatchData,
  generateVdsVehicleBatchData,
} from '@/lib/faker';
import { FieldConfig, SeedRequestConfig, SeedResult } from '@/types/seeder';
import { VDSEventData, VDSEventSourceType } from '@/types/vds-event';
import { TrafficIntervalType, VDSTrafficData } from '@/types/vds-traffic';
import { VDSVehicleClass, VDSVehicleData, VDSVehicleDirection } from '@/types/vds-vehicle';

export interface VdsResourceConfig<T extends object> {
  id: string;
  name: string;
  description: string;
  imageType?: number;
  fields: FieldConfig<T>[];
  fieldHelpText: string;
  sampleNotes?: string[];
  generateBatchData: (
    count: number,
    baseData: Partial<T>,
    configs: SeedRequestConfig<T>[]
  ) => T[];
  seedBatch: (data: T[]) => Promise<SeedResult>;
  seedSequential: (data: T[], onProgress?: (current: number, total: number) => void) => Promise<SeedResult>;
  seedConcurrent: (
    data: T[],
    concurrency: number,
    onProgress?: (current: number, total: number) => void
  ) => Promise<SeedResult>;
}

const EVENT_SOURCE_TYPE_LABELS = new Map<number, string>([
  [0, 'Unknown'],
  [1, 'Camera'],
  [2, 'Window Service'],
  [3, 'Third Party'],
]);

const TRAFFIC_INTERVAL_LABELS = new Map<number, string>([
  [0, 'Unknown'],
  [1, 'OneMinute'],
  [5, 'FiveMinutes'],
  [15, 'FifteenMinutes'],
]);

const VEHICLE_CLASS_LABELS = new Map<number, string>([
  [0, 'Unknown'],
  [1, 'Car'],
  [2, 'Truck'],
  [3, 'Bus'],
  [4, 'Motorbike'],
]);

const VEHICLE_DIRECTION_LABELS = new Map<number, string>([
  [0, 'Forward'],
  [1, 'Backward'],
]);

export const VDS_EVENT_RESOURCE: VdsResourceConfig<VDSEventData> = {
  id: 'vds-event',
  name: 'VDS Event',
  description: 'Dữ liệu sự kiện từ hệ thống phát hiện phương tiện (VDS)',
  imageType: 0,
  fields: [
    { name: 'eventTypeId', label: 'Event Type ID', type: 'uuid', required: false },
    {
      name: 'sourceType',
      label: 'Source Type',
      type: 'enum',
      enumValues: Object.values(VDSEventSourceType).filter((value): value is number => typeof value === 'number'),
      enumLabels: EVENT_SOURCE_TYPE_LABELS,
      required: true,
    },
    { name: 'laneCode', label: 'Lane Code', type: 'string', required: true },
    { name: 'zoneCode', label: 'Zone Code', type: 'string', required: false, disallowNull: true },
    { name: 'sourceReferenceId', label: 'Source Reference ID', type: 'uuid', required: true },
    { name: 'imageUrl', label: 'Image URL', type: 'string', required: false },
    { name: 'confidence', label: 'Confidence', type: 'number', required: false },
  ],
  fieldHelpText:
    'Zone Code = Auto sẽ lấy danh sách zone từ Master Data ở lúc Seed. Image URL = Auto sẽ random từ ảnh mẫu nội bộ rồi lưu vào server. Image URL = Fixed nếu nhập base64 thì cũng sẽ lưu ảnh vào server, còn URL thường thì dùng trực tiếp.',
  sampleNotes: [
    'Event Type ID: Auto hoặc NULL',
    'Source Type: Fixed = Camera',
    'Zone Code: Auto để lấy từ Master Data khi Seed',
    'Image URL: Auto để hệ thống tự tạo ảnh và lưu vào server',
  ],
  generateBatchData: generateVdsEventBatchData,
  seedBatch: (data) => apiService.seedBatch('/api/itd/vds/v-dSEvent-data/list', data),
  seedSequential: (data, onProgress) => apiService.seedSequential('/api/itd/vds/v-dSEvent-data/sequence', data, onProgress),
  seedConcurrent: (data, concurrency, onProgress) =>
    apiService.seedConcurrent('/api/itd/vds/v-dSEvent-data/sequence', data, concurrency, onProgress),
};

export const VDS_TRAFFIC_RESOURCE: VdsResourceConfig<VDSTrafficData> = {
  id: 'vds-traffic',
  name: 'VDS Traffic',
  description: 'Dữ liệu traffic tổng hợp theo khoảng thời gian từ hệ thống VDS',
  fields: [
    { name: 'laneCode', label: 'Lane Code', type: 'string', required: true },
    { name: 'zoneCode', label: 'Zone Code', type: 'string', required: false, disallowNull: true },
    { name: 'occurDate', label: 'Occur Date', type: 'string', required: true },
    {
      name: 'intervalType',
      label: 'Interval Type',
      type: 'enum',
      enumValues: Object.values(TrafficIntervalType).filter((value): value is number => typeof value === 'number'),
      enumLabels: TRAFFIC_INTERVAL_LABELS,
      required: true,
    },
    { name: 'numVehicles', label: 'Num Vehicles', type: 'number', required: true },
    { name: 'avgSpeed', label: 'Avg Speed', type: 'number', required: true },
    { name: 'occupancy', label: 'Occupancy', type: 'number', required: true },
    { name: 'avgDensity', label: 'Avg Density', type: 'number', required: false },
    { name: 'avgHeadway', label: 'Avg Headway', type: 'number', required: false },
    { name: 'confidence', label: 'Confidence', type: 'number', required: false },
  ],
  fieldHelpText:
    'Zone Code = Auto sẽ lấy danh sách zone từ Master Data ở lúc Seed. Các field số liệu traffic như Num Vehicles, Avg Speed, Occupancy có thể để Auto để mỗi record tự đổi.',
  sampleNotes: [
    'Occur Date: Auto để hệ thống tự lấy thời gian gần hiện tại',
    'Interval Type: Fixed = OneMinute nếu muốn dữ liệu đồng nhất',
    'Zone Code: Auto để lấy từ Master Data khi Seed',
  ],
  generateBatchData: generateVdsTrafficBatchData,
  seedBatch: (data) => apiService.seedBatch('/api/itd/vds/v-dSTraffic/list', data),
  seedSequential: (data, onProgress) => apiService.seedSequential('/api/itd/vds/v-dSTraffic/sequence', data, onProgress),
  seedConcurrent: (data, concurrency, onProgress) =>
    apiService.seedConcurrent('/api/itd/vds/v-dSTraffic/sequence', data, concurrency, onProgress),
};

export const VDS_VEHICLE_RESOURCE: VdsResourceConfig<VDSVehicleData> = {
  id: 'vds-vehicle',
  name: 'VDS Vehicle',
  description: 'Dữ liệu phương tiện nhận diện từ hệ thống VDS',
  imageType: 1,
  fields: [
    { name: 'zoneCode', label: 'Zone Code', type: 'string', required: false, disallowNull: true },
    { name: 'laneCode', label: 'Lane Code', type: 'string', required: true },
    { name: 'occurDate', label: 'Occur Date', type: 'string', required: true },
    { name: 'sourceReferenceId', label: 'Source Reference ID', type: 'uuid', required: true },
    { name: 'plate', label: 'Plate', type: 'string', required: true },
    {
      name: 'vehicleClass',
      label: 'Vehicle Class',
      type: 'enum',
      enumValues: Object.values(VDSVehicleClass).filter((value): value is number => typeof value === 'number'),
      enumLabels: VEHICLE_CLASS_LABELS,
      required: false,
    },
    { name: 'speed', label: 'Speed', type: 'number', required: false },
    { name: 'confidence', label: 'Confidence', type: 'number', required: false },
    { name: 'vehicleColor', label: 'Vehicle Color', type: 'string', required: false },
    { name: 'plateColor', label: 'Plate Color', type: 'string', required: false },
    { name: 'vehicleLength', label: 'Vehicle Length', type: 'number', required: false },
    {
      name: 'direction',
      label: 'Direction',
      type: 'enum',
      enumValues: Object.values(VDSVehicleDirection).filter((value): value is number => typeof value === 'number'),
      enumLabels: VEHICLE_DIRECTION_LABELS,
      required: false,
    },
    { name: 'imageUrl', label: 'Image URL', type: 'string', required: false },
    { name: 'isImputed', label: 'Is Imputed', type: 'boolean', required: false },
    { name: 'isBookmark', label: 'Is Bookmark', type: 'boolean', required: false },
    { name: 'confidenceColor', label: 'Confidence Color', type: 'number', required: false },
    { name: 'confidenceSpeed', label: 'Confidence Speed', type: 'number', required: false },
    { name: 'confidenceDirection', label: 'Confidence Direction', type: 'number', required: false },
  ],
  fieldHelpText:
    'Zone Code = Auto sẽ lấy danh sách zone từ Master Data ở lúc Seed. Image URL = Auto sẽ random từ ảnh mẫu nội bộ rồi lưu vào server với context VDSVehicle. Image URL = Fixed nếu nhập base64 thì cũng sẽ lưu ảnh vào server, còn URL thường thì dùng trực tiếp.',
  sampleNotes: [
    'Plate: Auto để mỗi record có biển số khác nhau',
    'Vehicle Class: Auto hoặc Fixed theo loại xe bạn muốn test',
    'Image URL: Auto để hệ thống tự tạo ảnh và lưu vào server',
  ],
  generateBatchData: generateVdsVehicleBatchData,
  seedBatch: (data) => apiService.seedBatch('/api/itd/vds/v-dSVehicle/list', data),
  seedSequential: (data, onProgress) => apiService.seedSequential('/api/itd/vds/v-dSVehicle/sequence', data, onProgress),
  seedConcurrent: (data, concurrency, onProgress) =>
    apiService.seedConcurrent('/api/itd/vds/v-dSVehicle/sequence', data, concurrency, onProgress),
};

export const VDS_RESOURCES = [VDS_EVENT_RESOURCE, VDS_TRAFFIC_RESOURCE, VDS_VEHICLE_RESOURCE] as const;

export function getVdsResourceConfig(resourceId: string) {
  return VDS_RESOURCES.find((resource) => resource.id === resourceId);
}
