export type SeedValue = string | number | boolean | null | undefined;
export type SeedRecord = Record<string, SeedValue>;

export interface FieldConfig<T extends object> {
  name: keyof T & string;
  label: string;
  type: 'enum' | 'string' | 'number' | 'uuid' | 'boolean';
  enumValues?: Array<string | number>;
  enumLabels?: Map<string | number, string>;
  required: boolean;
  disallowNull?: boolean;
}

export type FieldMode = 'auto' | 'manual' | 'disabled';
export type SeedMode = 'batch' | 'sequential' | 'concurrent';

export interface FieldSetting {
  mode: FieldMode;
  manualValue: string;
}

export interface SeedRequestConfig<T extends object> {
  fieldName: keyof T & string;
  isAutoGenerate: boolean;
}

export interface SeedResult {
  success: boolean;
  count: number;
  error?: string;
}

export interface ResourceApiResult {
  success: boolean;
  error?: string;
}
