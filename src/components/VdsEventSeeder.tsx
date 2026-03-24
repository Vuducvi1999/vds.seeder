'use client';

import { useState, useEffect } from 'react';
import { VDSEventType, VDSEventSourceType, VDSEventData, SeedingConfig } from '@/types/vds-event';
import { apiService } from '@/lib/api';
import { pkceAuthService } from '@/lib/auth-pkce';
import { generateBatchData } from '@/lib/faker';
import Settings from '@/components/Settings';

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

interface FieldConfig {
  name: keyof VDSEventData;
  label: string;
  type: 'enum' | 'string' | 'number' | 'date' | 'uuid';
  enumValues?: string[];
  required: boolean;
  defaultAuto: boolean;
}

export default function VdsEventSeeder() {
  const [count, setCount] = useState(10);
  const [batchSize, setBatchSize] = useState(10);
  const [configs, setConfigs] = useState<Record<string, boolean>>({});
  const [previewData, setPreviewData] = useState<VDSEventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [seededCount, setSeededCount] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email?: string; username?: string; name?: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const config = pkceAuthService.getConfig();
    const authState = pkceAuthService.getAuthState();
    
    setIsAuthenticated(authState.isAuthenticated);
    setUser(authState.user);
    
    if (config) {
      apiService.setConfig({ baseUrl: config.rootUrl });
    }

    const initialConfigs: Record<string, boolean> = {};
    VDS_EVENT_FIELDS.forEach((field) => {
      initialConfigs[field.name] = field.defaultAuto;
    });
    setConfigs(initialConfigs);
    
    setIsInitialized(true);
    
    if (authState.isAuthenticated && config) {
      pkceAuthService.init();
    }
  }, []);

  const handleLogin = () => {
    const config = pkceAuthService.getConfig();
    if (!config) {
      setShowSettings(true);
      return;
    }
    pkceAuthService.login();
  };

  const handleLogout = () => {
    pkceAuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
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
    const config = pkceAuthService.getConfig();
    if (!config) {
      setShowSettings(true);
      return;
    }

    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    setIsLoading(true);
    setResult(null);
    setSeededCount(0);

    const token = pkceAuthService.getAccessToken();
    if (token) {
      apiService.setToken(token);
    }

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
        if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
          const refreshed = await pkceAuthService.refreshAccessToken();
          if (refreshed) {
            apiService.setToken(pkceAuthService.getAccessToken() || '');
            const retryResponse = await apiService.seedVdsEventData(batchData);
            if (retryResponse.success) {
              totalSeeded += retryResponse.count;
              setSeededCount(totalSeeded);
              setCurrentBatch(i + 1);
              continue;
            }
          }
          setResult({ success: false, message: 'Session expired. Please login again.' });
          setIsAuthenticated(false);
          setUser(null);
          handleLogin();
          setIsLoading(false);
          return;
        }
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

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">API Data Seeder</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-600 hover:text-gray-900 transition"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Welcome, <span className="font-medium">{user.username || user.name || user.email}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                >
                  Login
                </button>
              )}
            </div>
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
              disabled={isLoading}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>
                  Seeding... ({currentBatch}/{totalBatches} batches, {seededCount} records)
                </span>
              ) : !isAuthenticated ? (
                'Login to Seed Data'
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
    </>
  );
}
