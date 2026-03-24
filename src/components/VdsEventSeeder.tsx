'use client';

import { useState, useEffect } from 'react';
import { VDSEventType, VDSEventSourceType, VDSEventData, SeedingConfig } from '@/types/vds-event';
import { apiService } from '@/lib/api';
import { generateBatchData } from '@/lib/faker';

interface FieldConfig {
  name: keyof VDSEventData;
  label: string;
  type: 'enum' | 'string' | 'number' | 'date' | 'uuid';
  enumValues?: string[];
  required: boolean;
  defaultAuto: boolean;
}

const VDS_EVENT_FIELDS: FieldConfig[] = [
  { name: 'eventType', label: 'Event Type', type: 'enum', enumValues: Object.values(VDSEventType), required: true, defaultAuto: true },
  { name: 'location', label: 'Location', type: 'string', required: true, defaultAuto: true },
  { name: 'sourceType', label: 'Source Type', type: 'enum', enumValues: Object.values(VDSEventSourceType), required: true, defaultAuto: true },
  { name: 'imagePath', label: 'Image Path', type: 'string', required: false, defaultAuto: true },
  { name: 'confidence', label: 'Confidence', type: 'number', required: false, defaultAuto: true },
  { name: 'deviceId', label: 'Device ID', type: 'uuid', required: true, defaultAuto: true },
  { name: 'occurDate', label: 'Occur Date', type: 'date', required: true, defaultAuto: true },
  { name: 'laneCode', label: 'Lane Code', type: 'string', required: true, defaultAuto: true },
];

export default function VdsEventSeeder() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [count, setCount] = useState(10);
  const [batchSize, setBatchSize] = useState(10);
  const [configs, setConfigs] = useState<Record<string, boolean>>({});
  const [previewData, setPreviewData] = useState<VDSEventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [seededCount, setSeededCount] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);

  useEffect(() => {
    const savedConfig = apiService.getConfig();
    if (savedConfig.baseUrl) {
      setApiUrl(savedConfig.baseUrl);
      setApiKey(savedConfig.apiKey || '');
    }

    const initialConfigs: Record<string, boolean> = {};
    VDS_EVENT_FIELDS.forEach((field) => {
      initialConfigs[field.name] = field.defaultAuto;
    });
    setConfigs(initialConfigs);
  }, []);

  const handleConnect = async () => {
    apiService.setConfig({ baseUrl: apiUrl, apiKey });
    const testResult = await apiService.testConnection();
    setIsConnected(testResult.success);
    setConnectionMessage(testResult.message);
  };

  const generatePreview = () => {
    const configList: SeedingConfig[] = VDS_EVENT_FIELDS.map((field) => ({
      fieldName: field.name,
      isAutoGenerate: configs[field.name] || false,
    }));

    const data = generateBatchData(3, {}, configList);
    setPreviewData(data);
  };

  const toggleConfig = (fieldName: string) => {
    setConfigs((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);
    setSeededCount(0);

    const configList: SeedingConfig[] = VDS_EVENT_FIELDS.map((field) => ({
      fieldName: field.name,
      isAutoGenerate: configs[field.name] || false,
    }));

    const batches = Math.ceil(count / batchSize);
    setTotalBatches(batches);
    setCurrentBatch(0);

    let totalSeeded = 0;
    const baseData: Partial<VDSEventData> = {};

    for (let i = 0; i < batches; i++) {
      const batchCount = Math.min(batchSize, count - totalSeeded);
      const batchData = generateBatchData(batchCount, baseData, configList);

      const response = await apiService.seedVdsEventData(batchData);

      if (!response.success) {
        setResult({ success: false, message: `Batch ${i + 1} failed: ${response.error}` });
        setIsLoading(false);
        return;
      }

      totalSeeded += response.count;
      setSeededCount(totalSeeded);
      setCurrentBatch(i + 1);
    }

    setResult({ success: true, message: `Successfully seeded ${totalSeeded} records in ${batches} batches` });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">VDS Event Data Seeder</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key (optional)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Bearer token"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleConnect}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Test Connection
          </button>
          {isConnected !== null && (
            <span className={`ml-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {connectionMessage}
            </span>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Seed Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Records to Seed</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Number of records per API call</p>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-3">Field Generation Strategy</h3>
          <p className="text-sm text-gray-600 mb-4">Toggle auto-generate for each field. Disabled fields will use default values.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VDS_EVENT_FIELDS.map((field) => (
              <label key={field.name} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={configs[field.name] || false}
                  onChange={() => toggleConfig(field.name)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Data Preview</h2>
            <button
              onClick={generatePreview}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Generate Preview
            </button>
          </div>
          {previewData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {VDS_EVENT_FIELDS.map((field) => (
                      <th key={field.name} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((data, idx) => (
                    <tr key={idx}>
                      {VDS_EVENT_FIELDS.map((field) => (
                        <td key={field.name} className="px-3 py-2 text-sm text-gray-900 truncate max-w-[150px]">
                          {data[field.name]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Click &quot;Generate Preview&quot; to see sample data</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <button
            onClick={handleSeed}
            disabled={isLoading || !apiUrl}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>
                Seeding... ({currentBatch}/{totalBatches} batches, {seededCount} records)
              </span>
            ) : (
              `Seed ${count} Records`
            )}
          </button>
          {result && (
            <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
