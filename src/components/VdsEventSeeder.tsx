'use client';

import { useState, useEffect } from 'react';
import { VDSEventType, VDSEventSourceType, VDSEventData } from '@/types/vds-event';
import { apiService } from '@/lib/api';
import { pkceAuthService } from '@/lib/auth-pkce';
import { generateBatchData } from '@/lib/faker';
import Settings from '@/components/Settings';

interface FieldConfig {
  name: keyof VDSEventData;
  label: string;
  type: 'enum' | 'string' | 'number' | 'date' | 'uuid';
  enumValues?: (string | number)[];
  required: boolean;
}

const VDS_EVENT_FIELDS: FieldConfig[] = [
  { name: 'eventType', label: 'Event Type', type: 'enum', enumValues: Object.values(VDSEventType).filter((v): v is number => typeof v === 'number'), required: true },
  { name: 'sourceType', label: 'Source Type', type: 'enum', enumValues: Object.values(VDSEventSourceType).filter((v): v is number => typeof v === 'number'), required: true },
  { name: 'deviceId', label: 'Device ID', type: 'uuid', required: true },
  { name: 'occurDate', label: 'Occur Date', type: 'date', required: true },
  { name: 'location', label: 'Location', type: 'string', required: true },
  { name: 'laneCode', label: 'Lane Code', type: 'string', required: true },
  { name: 'imagePath', label: 'Image Path', type: 'string', required: false },
  { name: 'confidence', label: 'Confidence', type: 'number', required: false },
];

type FieldMode = 'auto' | 'manual' | 'disabled';

interface FieldSetting {
  mode: FieldMode;
  manualValue: string;
}

export default function VdsEventSeeder() {
  const [count, setCount] = useState(10);
  const [fieldSettings, setFieldSettings] = useState<Record<string, FieldSetting>>({});
  const [previewData, setPreviewData] = useState<VDSEventData[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email?: string; username?: string; name?: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  useEffect(() => {
    const config = pkceAuthService.getConfig();
    const authState = pkceAuthService.getAuthState();

    setIsAuthenticated(authState.isAuthenticated);
    setUser(authState.user);

    if (config) {
      apiService.setConfig({ baseUrl: config.backendApiUrl });
    }

    const initialSettings: Record<string, FieldSetting> = {};
    VDS_EVENT_FIELDS.forEach((field) => {
      initialSettings[field.name] = { mode: 'auto', manualValue: '' };
    });
    setFieldSettings(initialSettings);

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

  const updateFieldSetting = (fieldName: string, setting: Partial<FieldSetting>) => {
    setFieldSettings((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], ...setting },
    }));
  };

  const generateData = (): VDSEventData[] => {
    const configs = VDS_EVENT_FIELDS.map((field) => {
      const setting = fieldSettings[field.name];
      return {
        fieldName: field.name,
        isAutoGenerate: setting.mode === 'auto',
      };
    });

    const baseData: Partial<VDSEventData> = {};
    VDS_EVENT_FIELDS.forEach((field) => {
      const setting = fieldSettings[field.name];
      if (setting.mode === 'manual' && setting.manualValue) {
        let value: string | number | null = setting.manualValue;
        if (field.type === 'number') {
          value = parseFloat(setting.manualValue) || 0;
        }
        (baseData as Record<string, unknown>)[field.name] = value;
      }
    });

    return generateBatchData(count, baseData, configs);
  };

  const generatePreview = () => {
    const data = generateData();
    setPreviewData(data);
    setEditMode(true);
  };

  const updatePreviewData = (index: number, fieldName: string, value: string) => {
    setPreviewData((prev) => {
      const newData = [...prev];
      const field = VDS_EVENT_FIELDS.find((f) => f.name === fieldName);
      let parsedValue: string | number | null = value;

      if (field?.type === 'number') {
        parsedValue = value ? parseFloat(value) : null;
      } else if (field?.type === 'enum') {
        parsedValue = value ? parseInt(value) : null;
      }

      newData[index] = { ...newData[index], [fieldName]: parsedValue };
      return newData;
    });
  };

  const handleSeed = async (dataToSeed?: VDSEventData[]) => {
    const config = pkceAuthService.getConfig();
    if (!config) {
      setShowSettings(true);
      return;
    }

    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    const data = dataToSeed || previewData;
    if (!data || data.length === 0) {
      setResult({ success: false, message: 'No data to seed' });
      return;
    }

    setIsLoading(true);
    setResult(null);

    const token = pkceAuthService.getAccessToken();
    if (token) {
      apiService.setToken(token);
    }

    const response = await apiService.seedVdsEventData(data);

    if (!response.success) {
      if (response.error?.includes('401') || response.error?.includes('Unauthorized')) {
        const refreshed = await pkceAuthService.refreshAccessToken();
        if (refreshed) {
          apiService.setToken(pkceAuthService.getAccessToken() || '');
          const retryResponse = await apiService.seedVdsEventData(data);
          if (retryResponse.success) {
            setResult({ success: true, message: `Successfully seeded ${retryResponse.count} records` });
            setIsLoading(false);
            return;
          }
        }
        setResult({ success: false, message: 'Session expired. Please login again.' });
        setIsAuthenticated(false);
        setUser(null);
        handleLogin();
        setIsLoading(false);
        return;
      }
      setResult({ success: false, message: `Failed: ${response.error}` });
      setIsLoading(false);
      return;
    }

    setResult({ success: true, message: `Successfully seeded ${response.count} records` });
    setPreviewData([]);
    setEditMode(false);
    setIsLoading(false);
  };

  const handleSeedDirect = async () => {
    const data = generateData();
    await handleSeed(data);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const getModeColor = (mode: FieldMode) => {
    switch (mode) {
      case 'auto': return 'bg-blue-500';
      case 'manual': return 'bg-emerald-500';
      case 'disabled': return 'bg-slate-500';
    }
  };

  const getModeLabel = (mode: FieldMode) => {
    switch (mode) {
      case 'auto': return 'Auto';
      case 'manual': return 'Fixed';
      case 'disabled': return 'NULL';
    }
  };

  return (
    <>
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white">Data Seeder</h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/50">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-sm text-slate-300">{user.username || user.name || user.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Configuration Section */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Configuration</h2>
                  <p className="text-sm text-slate-400">Set number of records and configure each field</p>
                </div>
              </div>

              {/* Record Count */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Records</label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                    min={1}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <button onClick={() => setCount(Math.max(1, count - 1))} className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <button onClick={() => setCount(count + 1)} className="p-1 rounded-lg bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Field Cards */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300 mb-3">Field Generation Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {VDS_EVENT_FIELDS.map((field) => {
                    const setting = fieldSettings[field.name] || { mode: 'auto', manualValue: '' };
                    const isExpanded = expandedField === field.name;

                    return (
                      <div
                        key={field.name}
                        className={`border rounded-xl transition-all duration-200 ${isExpanded
                          ? 'border-blue-500/50 bg-slate-900/50'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                          }`}
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => setExpandedField(isExpanded ? null : field.name)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${getModeColor(setting.mode)}`}></span>
                              <span className="font-medium text-white text-sm">{field.label}</span>
                              {field.required && <span className="text-red-400 text-xs">Required</span>}
                            </div>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>

                          <div className="flex gap-2">
                            {(['auto', 'manual', 'disabled'] as FieldMode[]).map((mode) => (
                              <button
                                key={mode}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateFieldSetting(field.name, { mode });
                                }}
                                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${setting.mode === mode
                                  ? `${getModeColor(mode)} text-white shadow-lg`
                                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                  }`}
                              >
                                {getModeLabel(mode)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {isExpanded && setting.mode === 'manual' && (
                          <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
                            <input
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'datetime-local' : 'text'}
                              value={setting.manualValue}
                              onChange={(e) => updateFieldSetting(field.name, { manualValue: e.target.value })}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={generatePreview}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Generate Preview
                </button>
                {editMode && (
                  <button
                    onClick={() => { setPreviewData([]); setEditMode(false); }}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {editMode && previewData.length > 0 && (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Data Preview</h2>
                      <p className="text-sm text-slate-400">Click cells to edit • {previewData.length} records</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-12">#</th>
                      {VDS_EVENT_FIELDS.map((field) => (
                        <th key={field.name} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[140px]">
                          <div className="flex items-center gap-1">
                            {field.label}
                            {fieldSettings[field.name]?.mode === 'manual' && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">fixed</span>
                            )}
                            {fieldSettings[field.name]?.mode === 'disabled' && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-600 text-slate-400 text-[10px]">null</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {previewData.map((data, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{idx + 1}</td>
                        {VDS_EVENT_FIELDS.map((field) => {
                          const isEditable = fieldSettings[field.name]?.mode === 'auto';
                          return (
                            <td key={field.name} className="px-2 py-2">
                              {isEditable ? (
                                field.type === 'enum' ? (
                                  <select
                                    value={data[field.name] as number}
                                    onChange={(e) => updatePreviewData(idx, field.name, e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  >
                                    {field.enumValues?.map((val) => (
                                      <option key={val} value={val}>{val}</option>
                                    ))}
                                  </select>
                                ) : field.type === 'date' ? (
                                  <input
                                    type="datetime-local"
                                    value={data[field.name] ? (data[field.name] as string).slice(0, 16) : ''}
                                    onChange={(e) => updatePreviewData(idx, field.name, new Date(e.target.value).toISOString())}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  />
                                ) : (
                                  <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    value={data[field.name] as string ?? ''}
                                    onChange={(e) => updatePreviewData(idx, field.name, e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  />
                                )
                              ) : (
                                <div className="px-3 py-2 text-sm text-slate-400 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                  {fieldSettings[field.name]?.mode === 'manual'
                                    ? fieldSettings[field.name]?.manualValue || '-'
                                    : (data[field.name]?.toString() || '-')
                                  }
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Seed Button */}
          <div className="sticky bottom-6">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 shadow-2xl">
              <button
                onClick={handleSeedDirect}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                  isLoading
                    ? 'bg-slate-600 cursor-wait'
                    : !pkceAuthService.getConfig()
                      ? 'bg-slate-600 cursor-not-allowed'
                      : !isAuthenticated
                        ? 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/30'
                } text-white`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    Seeding...
                  </>
                ) : !pkceAuthService.getConfig() ? (
                  'Configure API in Settings'
                ) : !isAuthenticated ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Seed Data
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Seed {count} Records
                  </>
                )}
              </button>

              {result && (
                <div className={`mt-3 p-4 rounded-xl flex items-center gap-3 ${
                  result.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  {result.success ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={result.success ? 'text-emerald-300' : 'text-red-300'}>{result.message}</span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
