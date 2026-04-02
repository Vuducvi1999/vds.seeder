'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import * as Progress from '@radix-ui/react-progress';
import Settings from '@/components/Settings';
import { apiService } from '@/lib/api';
import { pkceAuthService } from '@/lib/auth-pkce';
import { getRandomImageBase64Sample, isBase64ImageValue, normalizeBase64ImageValue } from '@/lib/image-base64-samples';
import { VdsResourceConfig, VDS_RESOURCES } from '@/lib/vds-resource-config';
import { FieldConfig, FieldMode, FieldSetting, ResourceApiResult, SeedMode, SeedValue } from '@/types/seeder';

const RESOURCE_ICONS: Record<string, string> = {
  'vds-event': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'vds-traffic': 'M3 12h3m0 0l3-3m-3 3l3 3m3-6h8m-8 6h8',
  'vds-vehicle': 'M3 13l1-4a2 2 0 012-1.5h8a2 2 0 012 1.5l1 4M5 13h14m-1 0v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H9v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4m1-3h.01M17 10h.01',
};

interface Props<T extends object> {
  config: VdsResourceConfig<T>;
}

export default function VdsResourceSeeder<T extends object>({ config }: Props<T>) {
  const [count, setCount] = useState(10);
  const [concurrentCount, setConcurrentCount] = useState(5);
  const [sequentialBatchSize, setSequentialBatchSize] = useState(1000);
  const [sequentialWaitSeconds, setSequentialWaitSeconds] = useState(60);
  const [seedMode, setSeedMode] = useState<SeedMode>('batch');
  const [fieldSettings, setFieldSettings] = useState<Record<string, FieldSetting>>({});
  const [previewData, setPreviewData] = useState<T[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email?: string; username?: string; name?: string } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [resultTimer, setResultTimer] = useState<{ start: number; duration: number } | null>(null);
  const [progressPercent, setProgressPercent] = useState(100);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [zoneCodeOptions, setZoneCodeOptions] = useState<string[]>([]);
  const [isLoadingZoneCodeOptions, setIsLoadingZoneCodeOptions] = useState(false);

  useEffect(() => {
    if (!resultTimer) {
      return;
    }

    setProgressPercent(100);
    const interval = setInterval(() => {
      const elapsed = Date.now() - resultTimer.start;
      const remaining = Math.max(0, resultTimer.duration - elapsed);
      setProgressPercent((remaining / resultTimer.duration) * 100);

      if (elapsed >= resultTimer.duration) {
        setResult(null);
        setResultTimer(null);
        setProgressPercent(100);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [resultTimer]);

  const showResult = (success: boolean, message: string, autoDismiss = true) => {
    setResult({ success, message });
    if (autoDismiss) {
      setResultTimer({ start: Date.now(), duration: 3000 });
    }
  };

  const loadConfig = useCallback(() => {
    const authConfig = pkceAuthService.getConfig();
    const authState = pkceAuthService.getAuthState();
    const token = pkceAuthService.getAccessToken() || '';

    setIsAuthenticated(authState.isAuthenticated);
    setUser(authState.user);

    if (authConfig) {
      apiService.setConfig({ baseUrl: authConfig.backendApiUrl, token });
    }

    if (authState.isAuthenticated && authConfig) {
      pkceAuthService.init();
    }
  }, []);

  useEffect(() => {
    const initialSettings: Record<string, FieldSetting> = {};
    for (const field of config.fields) {
      initialSettings[field.name] = { mode: 'auto', manualValue: '' };
    }

    setFieldSettings(initialSettings);
    setPreviewData([]);
    setEditMode(false);
    setSeedMode('batch');
    setIsInitialized(true);
    loadConfig();
  }, [config, loadConfig]);

  useEffect(() => {
    if (!showSettings) {
      loadConfig();
    }
  }, [showSettings, loadConfig]);

  const handleLogin = () => {
    const authConfig = pkceAuthService.getConfig();
    if (!authConfig) {
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

  const handleExpiredSession = () => {
    showResult(false, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    setIsAuthenticated(false);
    setUser(null);
    handleLogin();
  };

  const resetLoadingState = () => {
    setIsLoading(false);
    setProgress(null);
    setLoadingMessage(null);
  };

  const runAuthorizedRequest = useCallback(async <TResult extends ResourceApiResult>(request: () => Promise<TResult>) => {
    let response = await request();

    if (response.success || response.error !== '401') {
      return response;
    }

    const refreshed = await pkceAuthService.refreshAccessToken();
    if (!refreshed) {
      return response;
    }

    apiService.setToken(pkceAuthService.getAccessToken() || '');
    response = await request();
    return response;
  }, []);

  const updateFieldSetting = (fieldName: string, setting: Partial<FieldSetting>) => {
    const field = config.fields.find((item) => item.name === fieldName);
    if ((field?.required || field?.disallowNull) && setting.mode === 'disabled') {
      return;
    }

    setFieldSettings((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], ...setting },
    }));
  };

  const parseManualValue = useCallback((field: FieldConfig<T>, value: string): SeedValue => {
    if (field.type === 'number') {
      return value ? parseFloat(value) : null;
    }

    if (field.type === 'enum') {
      return value ? parseInt(value, 10) : null;
    }

    if (field.type === 'boolean') {
      if (!value) {
        return null;
      }

      return value === 'true';
    }

    return value;
  }, []);

  const generateData = useCallback((): T[] => {
    const configs = config.fields.map((field) => ({
      fieldName: field.name,
      isAutoGenerate: (fieldSettings[field.name] ?? { mode: 'auto', manualValue: '' }).mode === 'auto',
    }));

    const baseData: Partial<T> = {};
    for (const field of config.fields) {
      const setting = fieldSettings[field.name] ?? { mode: 'auto', manualValue: '' };
      if (setting.mode === 'manual' && setting.manualValue) {
        (baseData as Record<string, SeedValue>)[field.name] = parseManualValue(field, setting.manualValue);
      } else if (setting.mode === 'disabled') {
        (baseData as Record<string, SeedValue>)[field.name] = null;
      }
    }

    const recordCount = seedMode === 'sequential' ? 1 : seedMode === 'concurrent' ? concurrentCount : count;
    return config.generateBatchData(recordCount, baseData, configs);
  }, [concurrentCount, config, count, fieldSettings, parseManualValue, seedMode]);

  const generatePreview = () => {
    setPreviewData(generateData());
    setEditMode(true);
  };

  useEffect(() => {
    if (!editMode) {
      return;
    }

    setPreviewData(generateData());
  }, [editMode, generateData]);

  const updatePreviewData = (index: number, fieldName: string, value: string) => {
    setPreviewData((prev) => {
      const next = [...prev];
      const field = config.fields.find((item) => item.name === fieldName);
      if (!field) {
        return next;
      }

      next[index] = {
        ...next[index],
        [fieldName]: parseManualValue(field, value),
      };
      return next;
    });
  };

  const hasZoneCodeField = config.fields.some((field) => field.name === 'zoneCode');
  const hasImageField = config.fields.some((field) => field.name === 'imageUrl');

  const loadZoneCodeOptions = useCallback(async () => {
    if (!hasZoneCodeField || !isAuthenticated) {
      setZoneCodeOptions([]);
      return;
    }

    setIsLoadingZoneCodeOptions(true);
    const result = await runAuthorizedRequest(() => apiService.getZoneCodes());

    if (!result.success) {
      setZoneCodeOptions([]);
      setIsLoadingZoneCodeOptions(false);
      return;
    }

    const zoneCodes = [...new Set((result.zoneCodes ?? []).map((item) => item.trim()).filter(Boolean))];
    setZoneCodeOptions(zoneCodes);
    setIsLoadingZoneCodeOptions(false);
  }, [hasZoneCodeField, isAuthenticated, runAuthorizedRequest]);

  useEffect(() => {
    void loadZoneCodeOptions();
  }, [loadZoneCodeOptions]);

  const prepareZoneCodesForSeed = useCallback(async (data: T[]) => {
    if (!hasZoneCodeField || fieldSettings.zoneCode?.mode !== 'auto') {
      return { success: true } as const;
    }

    const recordsToUpdate = data.filter((item) => {
      const zoneCode = (item as Record<string, SeedValue>).zoneCode;
      return typeof zoneCode !== 'string' || !zoneCode.trim();
    });

    if (recordsToUpdate.length === 0) {
      return { success: true } as const;
    }

    setLoadingMessage('Đang lấy Zone Code từ Master Data...');
    const zoneResult = await runAuthorizedRequest(() => apiService.getZoneCodes());
    if (!zoneResult.success) {
      return { success: false, error: zoneResult.error || 'Không thể lấy danh sách Zone Code' } as const;
    }

    const zoneCodes = [...new Set((zoneResult.zoneCodes ?? []).map((item) => item.trim()).filter(Boolean))];
    if (zoneCodes.length === 0) {
      return { success: true } as const;
    }

    for (const item of recordsToUpdate) {
      (item as Record<string, SeedValue>).zoneCode = zoneCodes[Math.floor(Math.random() * zoneCodes.length)];
    }

    return { success: true } as const;
  }, [fieldSettings.zoneCode?.mode, hasZoneCodeField, runAuthorizedRequest]);

  const saveImageToServer = useCallback(async (base64Image: string) => {
    if (config.imageType === undefined) {
      return { success: false, error: 'Resource này không hỗ trợ lưu ảnh' } as const;
    }

    const result = await runAuthorizedRequest(() => apiService.saveBase64Image(base64Image, config.imageType!));
    if (!result.success) {
      return { success: false, error: result.error || 'Không thể lưu ảnh vào server' } as const;
    }

    if (!result.imageUrl) {
      return { success: false, error: 'API lưu ảnh không trả về ImageUrl' } as const;
    }

    return { success: true, imageUrl: result.imageUrl } as const;
  }, [config.imageType, runAuthorizedRequest]);

  const prepareImagesForSeed = useCallback(async (data: T[]) => {
    if (!hasImageField || config.imageType === undefined) {
      return { success: true } as const;
    }

    const imageMode = fieldSettings.imageUrl?.mode;
    if (imageMode === 'manual') {
      const manualValue = fieldSettings.imageUrl?.manualValue?.trim() ?? '';
      if (!manualValue || !isBase64ImageValue(manualValue)) {
        return { success: true } as const;
      }

      setLoadingMessage('Đang lưu Image URL Fixed vào server...');
      const saveResult = await saveImageToServer(normalizeBase64ImageValue(manualValue));
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error === '401'
            ? '401'
            : `Không thể lưu Image URL Fixed vào server: ${saveResult.error || 'Lỗi không xác định'}`,
        } as const;
      }

      for (const item of data) {
        (item as Record<string, SeedValue>).imageUrl = saveResult.imageUrl;
      }

      return { success: true } as const;
    }

    if (imageMode !== 'auto') {
      return { success: true } as const;
    }

    const recordsToUpdate = data
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const currentValue = (item as Record<string, SeedValue>).imageUrl;
        return typeof currentValue !== 'string' || !currentValue.trim() || isBase64ImageValue(currentValue);
      });

    if (recordsToUpdate.length === 0) {
      return { success: true } as const;
    }

    for (let i = 0; i < recordsToUpdate.length; i++) {
      const record = recordsToUpdate[i];
      setLoadingMessage(`Đang chuẩn bị Image URL cho record ${i + 1}/${recordsToUpdate.length}...`);

      const currentValueRaw = (record.item as Record<string, SeedValue>).imageUrl;
      const currentValue = typeof currentValueRaw === 'string' ? currentValueRaw.trim() : '';
      const base64Image = currentValue ? normalizeBase64ImageValue(currentValue) : getRandomImageBase64Sample();
      const saveResult = await saveImageToServer(base64Image);

      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error === '401'
            ? '401'
            : `Không thể lưu ảnh vào server cho record ${record.index + 1}: ${saveResult.error || 'Lỗi không xác định'}`,
        } as const;
      }

      (record.item as Record<string, SeedValue>).imageUrl = saveResult.imageUrl;
    }

    return { success: true } as const;
  }, [config.imageType, fieldSettings.imageUrl?.manualValue, fieldSettings.imageUrl?.mode, hasImageField, saveImageToServer]);

  const prepareDataForSeed = useCallback(async (data: T[]) => {
    const preparedData = data.map((item) => ({ ...item }));

    const zoneResult = await prepareZoneCodesForSeed(preparedData);
    if (!zoneResult.success) {
      return { success: false, error: zoneResult.error } as const;
    }

    const imageResult = await prepareImagesForSeed(preparedData);
    if (!imageResult.success) {
      return { success: false, error: imageResult.error } as const;
    }

    setLoadingMessage(null);
    return { success: true, data: preparedData } as const;
  }, [prepareImagesForSeed, prepareZoneCodesForSeed]);

  const handleSeed = async (dataToSeed?: T[]) => {
    const authConfig = pkceAuthService.getConfig();
    if (!authConfig) {
      setShowSettings(true);
      return;
    }

    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    const data = dataToSeed || previewData;
    if (!data || data.length === 0) {
      showResult(false, 'Chưa có dữ liệu để Seed');
      return;
    }

    setIsLoading(true);
    setProgress(seedMode !== 'batch' ? { current: 0, total: data.length } : null);
    setLoadingMessage(null);
    const startTime = Date.now();

    const token = pkceAuthService.getAccessToken();
    if (token) {
      apiService.setToken(token);
    }

    if (seedMode === 'sequential' || seedMode === 'concurrent') {
      const bufferResult = await runAuthorizedRequest(() =>
        apiService.changeBufferingChannelSetting(sequentialBatchSize, sequentialWaitSeconds)
      );

      if (!bufferResult.success) {
        if (bufferResult.error === '401') {
          handleExpiredSession();
        } else {
          showResult(false, `Không thể cập nhật cấu hình buffer: ${bufferResult.error}`);
        }

        resetLoadingState();
        return;
      }
    }

    const preparedResult = await prepareDataForSeed(data);
    if (!preparedResult.success || !preparedResult.data) {
      if (preparedResult.error === '401') {
        handleExpiredSession();
      } else {
        showResult(false, `Không thể chuẩn bị dữ liệu trước khi Seed: ${preparedResult.error}`);
      }

      resetLoadingState();
      return;
    }

    const preparedData = preparedResult.data;
    const seedWithProgress = async () => {
      switch (seedMode) {
        case 'sequential':
          return config.seedSequential(preparedData, (current, total) => setProgress({ current, total }));
        case 'concurrent':
          return config.seedConcurrent(preparedData, concurrentCount, (current, total) => setProgress({ current, total }));
        default:
          return config.seedBatch(preparedData);
      }
    };

    const durationToText = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`);
    let response = await seedWithProgress();
    const duration = Date.now() - startTime;

    if (!response.success) {
      if (response.error?.includes('401') || response.error?.includes('Không có quyền')) {
        const refreshed = await pkceAuthService.refreshAccessToken();
        if (refreshed) {
          apiService.setToken(pkceAuthService.getAccessToken() || '');
          response = await seedWithProgress();
          if (response.success) {
            const message = response.error
              ? `Đã Seed ${response.count}/${preparedData.length} record trong ${durationToText(duration)} (${response.error})`
              : `Seed thành công ${response.count} record trong ${durationToText(duration)}`;
            showResult(true, message);
            resetLoadingState();
            return;
          }
        }

        handleExpiredSession();
        resetLoadingState();
        return;
      }

      showResult(false, `Seed thất bại: ${response.error}`);
      resetLoadingState();
      return;
    }

    const message = response.error
      ? `Đã Seed ${response.count}/${preparedData.length} record trong ${durationToText(duration)} (${response.error})`
      : `Seed thành công ${response.count} record trong ${durationToText(duration)}`;

    showResult(true, message);
    setPreviewData([]);
    setEditMode(false);
    resetLoadingState();
  };

  const handleSeedDirect = async () => {
    const data = editMode && previewData.length > 0 ? previewData : generateData();
    await handleSeed(data);
  };

  const formatValue = (field: FieldConfig<T>, value: SeedValue) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (field.type === 'enum' && field.enumLabels) {
      return field.enumLabels.get(value as string | number) || String(value);
    }

    if (field.type === 'boolean') {
      return value ? 'true' : 'false';
    }

    return String(value);
  };

  const renderManualFieldInput = (field: FieldConfig<T>, setting: FieldSetting) => {
    if (field.name === 'zoneCode') {
      const isDisabled = !isAuthenticated || isLoadingZoneCodeOptions || zoneCodeOptions.length === 0;
      const placeholder = !isAuthenticated
        ? 'Login để tải Zone Code...'
        : isLoadingZoneCodeOptions
          ? 'Đang tải Zone Code...'
          : zoneCodeOptions.length === 0
            ? 'Không có Zone Code để chọn'
            : 'Chọn Zone Code...';

      return (
        <select
          value={setting.manualValue}
          onChange={(event) => updateFieldSetting(field.name, { manualValue: event.target.value })}
          disabled={isDisabled}
          className="w-full px-2 py-1 bg-slate-900/50 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {zoneCodeOptions.map((zoneCode) => (
            <option key={zoneCode} value={zoneCode}>
              {zoneCode}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'enum') {
      return (
        <select
          value={setting.manualValue}
          onChange={(event) => updateFieldSetting(field.name, { manualValue: event.target.value })}
          className="w-full px-2 py-1 bg-slate-900/50 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
        >
          <option value="">Chọn {field.label}...</option>
          {field.enumValues?.map((value) => (
            <option key={value} value={value}>
              {field.enumLabels?.get(value) || value}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'boolean') {
      return (
        <select
          value={setting.manualValue}
          onChange={(event) => updateFieldSetting(field.name, { manualValue: event.target.value })}
          className="w-full px-2 py-1 bg-slate-900/50 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
        >
          <option value="">Chọn {field.label}...</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    return (
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={setting.manualValue}
        onChange={(event) => updateFieldSetting(field.name, { manualValue: event.target.value })}
        placeholder="Nhập giá trị..."
        className="w-full px-2 py-1 bg-slate-900/50 border border-slate-600/50 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
      />
    );
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Công cụ nạp dữ liệu mẫu</h1>
                  <p className="text-sm text-slate-400">{config.name}</p>
                </div>
              </a>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1.724 1.724 0 013.35 0l.16.73a1.724 1.724 0 002.573 1.066l.646-.373a1.724 1.724 0 012.35.632l.375.648a1.724 1.724 0 01-.632 2.35l-.646.373a1.724 1.724 0 000 2.986l.646.373a1.724 1.724 0 01.632 2.35l-.375.648a1.724 1.724 0 01-2.35.632l-.646-.373a1.724 1.724 0 00-2.573 1.066l-.16.73a1.724 1.724 0 01-3.35 0l-.16-.73a1.724 1.724 0 00-2.573-1.066l-.646.373a1.724 1.724 0 01-2.35-.632l-.375-.648a1.724 1.724 0 01.632-2.35l.646-.373a1.724 1.724 0 000-2.986l-.646-.373a1.724 1.724 0 01-.632-2.35l.375-.648a1.724 1.724 0 012.35-.632l.646.373a1.724 1.724 0 002.573-1.066l.16-.73z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </button>

                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden md:block text-right">
                      <div className="text-sm text-white">{user?.name || user?.username || user?.email || 'Đã đăng nhập'}</div>
                      <div className="text-xs text-slate-400">Sẵn sàng Seed</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all text-sm"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all text-sm"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-4 items-start">
          <aside className="w-52 flex-shrink-0 sticky top-[65px]">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-700/50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loại dữ liệu</p>
              </div>
              <nav className="p-2 space-y-1">
                {VDS_RESOURCES.map((resource) => (
                  <Link
                    key={resource.id}
                    href={`/seed/${resource.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                      resource.id === config.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={RESOURCE_ICONS[resource.id]} />
                    </svg>
                    <span className="truncate">{resource.name}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0 space-y-6">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <h2 className="text-lg font-semibold text-white mb-1">{config.name}</h2>
            <p className="text-sm text-slate-400">{config.description}</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Cách gửi dữ liệu</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  onClick={() => { setSeedMode('batch'); setPreviewData([]); setEditMode(false); }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    seedMode === 'batch'
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  Batch
                </button>
                <button
                  onClick={() => { setSeedMode('sequential'); setPreviewData([]); setEditMode(false); }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    seedMode === 'sequential'
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  Sequential
                </button>
                <button
                  onClick={() => { setSeedMode('concurrent'); setPreviewData([]); setEditMode(false); }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    seedMode === 'concurrent'
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                      : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  Concurrent
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {seedMode === 'batch'
                  ? 'Gửi tất cả record trong một request'
                  : seedMode === 'sequential'
                    ? 'Gửi từng record một (endpoint /sequence). Dùng chung buffer backend với Concurrent.'
                    : 'Gửi nhiều request đồng thời (endpoint /sequence). Dùng chung buffer backend với Sequential.'}
              </p>
            </div>

            {(seedMode === 'sequential' || seedMode === 'concurrent') && (
              <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-slate-300">Cấu hình buffer backend dùng chung</label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Panel này dùng chung cho cả Sequential và Concurrent vì hai chế độ này đều đi qua cùng một buffer backend. Các giá trị này được gửi lên backend trước khi bắt đầu Seed. Nếu không chắc, cứ để mặc định 1000 record và 60 giây.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Số record mỗi lô <span className="text-slate-500">(backend gom đủ số này thì flush)</span>
                    </label>
                    <input
                      type="number"
                      value={sequentialBatchSize}
                      onChange={(event) => setSequentialBatchSize(Math.max(1, parseInt(event.target.value, 10) || 1))}
                      min={1}
                      className="w-[140px] px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Thời gian chờ tối đa <span className="text-slate-500">(giây)</span>
                    </label>
                    <input
                      type="number"
                      value={sequentialWaitSeconds}
                      onChange={(event) => setSequentialWaitSeconds(Math.max(1, parseInt(event.target.value, 10) || 1))}
                      min={1}
                      className="w-[140px] px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {seedMode === 'batch' && (
              <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <label className="block text-sm font-medium text-slate-300 mb-2">Số lượng record</label>
                <input
                  type="number"
                  value={count}
                  onChange={(event) => setCount(Math.max(1, parseInt(event.target.value, 10) || 1))}
                  min={1}
                  className="w-[140px] px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {seedMode === 'concurrent' && (
              <div className="mb-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <label className="block text-sm font-medium text-slate-300 mb-2">Số request song song</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={concurrentCount}
                    onChange={(event) => setConcurrentCount(Math.max(1, parseInt(event.target.value, 10) || 1))}
                    min={1}
                    className="w-[140px] px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-500">request sẽ được gửi đồng thời. Vẫn dùng chung buffer backend ở panel phía trên.</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cách tạo dữ liệu cho từng trường</label>
              <p className="text-xs text-slate-500 mb-2">{config.fieldHelpText}</p>

              {config.sampleNotes && config.sampleNotes.length > 0 && (
                <div className="mb-3 rounded-lg border border-slate-700/50 bg-slate-900/30 p-3">
                  <p className="text-xs font-medium text-slate-300 mb-2">Ví dụ cấu hình nhanh</p>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {config.sampleNotes.map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {config.fields.map((field) => {
                  const setting = fieldSettings[field.name] || { mode: 'auto', manualValue: '' };
                  const modeColors: Record<FieldMode, string> = {
                    auto: 'bg-blue-500/10 border-blue-500/30',
                    manual: 'bg-emerald-500/10 border-emerald-500/30',
                    disabled: 'bg-slate-500/10 border-slate-500/30',
                  };

                  return (
                    <div key={field.name} className={`p-2 rounded-lg border transition-colors ${modeColors[setting.mode]}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-white flex-1 truncate">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </span>
                        <div className="flex gap-1">
                          {(['auto', 'manual', 'disabled'] as FieldMode[]).map((mode) => (
                            <label
                              key={mode}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer transition-colors ${
                                setting.mode === mode
                                  ? mode === 'auto'
                                    ? 'text-blue-400'
                                    : mode === 'manual'
                                      ? 'text-emerald-400'
                                      : 'text-slate-400'
                                  : 'text-slate-500 hover:text-slate-300'
                              } ${(field.required || field.disallowNull) && mode === 'disabled' ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              <input
                                type="radio"
                                name={field.name}
                                value={mode}
                                checked={setting.mode === mode}
                                disabled={(field.required || field.disallowNull) && mode === 'disabled'}
                                onChange={() => updateFieldSetting(field.name, { mode })}
                                className="sr-only"
                              />
                              <span className={`w-2.5 h-2.5 rounded-full border-2 ${
                                setting.mode === mode
                                  ? mode === 'auto'
                                    ? 'border-blue-400 bg-blue-400'
                                    : mode === 'manual'
                                      ? 'border-emerald-400 bg-emerald-400'
                                      : 'border-slate-400 bg-slate-400'
                                  : 'border-slate-500'
                              }`}></span>
                              {mode === 'auto' ? 'Auto' : mode === 'manual' ? 'Fixed' : 'NULL'}
                            </label>
                          ))}
                        </div>
                      </div>

                      {setting.mode === 'manual' && renderManualFieldInput(field, setting)}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={generatePreview}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/20 text-sm font-medium"
              >
                Tạo Preview
              </button>
              {editMode && (
                <button
                  onClick={() => { setPreviewData([]); setEditMode(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-200 text-sm"
                >
                  Xóa Preview
                </button>
              )}
            </div>
          </div>

          {editMode && previewData.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white">Preview</h2>
                    <p className="text-xs text-slate-400">Nhấn vào ô để chỉnh sửa • {previewData.length} record</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider w-10">#</th>
                      {config.fields.map((field) => (
                        <th key={field.name} className="px-3 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[120px]">
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
                    {previewData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{rowIndex + 1}</td>
                        {config.fields.map((field) => {
                          const isEditable = fieldSettings[field.name]?.mode === 'auto';
                          const rawValue = row[field.name];

                          return (
                            <td key={field.name} className="px-2 py-2">
                              {isEditable ? (
                                field.type === 'enum' ? (
                                  <select
                                    value={rawValue === null || rawValue === undefined ? '' : String(rawValue)}
                                    onChange={(event) => updatePreviewData(rowIndex, field.name, event.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  >
                                    {field.enumValues?.map((value) => (
                                      <option key={value} value={value}>
                                        {field.enumLabels?.get(value) || value}
                                      </option>
                                    ))}
                                  </select>
                                ) : field.type === 'boolean' ? (
                                  <select
                                    value={rawValue === null || rawValue === undefined ? '' : String(rawValue)}
                                    onChange={(event) => updatePreviewData(rowIndex, field.name, event.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  >
                                    <option value="true">true</option>
                                    <option value="false">false</option>
                                  </select>
                                ) : (
                                  <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    value={rawValue === null || rawValue === undefined ? '' : String(rawValue)}
                                    onChange={(event) => updatePreviewData(rowIndex, field.name, event.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  />
                                )
                              ) : (
                                <div className="px-3 py-2 text-sm bg-slate-900/50 rounded-lg border border-slate-700/50">
                                  {fieldSettings[field.name]?.mode === 'disabled' ? (
                                    <span className="text-slate-500 italic">null</span>
                                  ) : fieldSettings[field.name]?.mode === 'manual' ? (
                                    <span className="text-slate-400">
                                      {formatValue(field, parseManualValue(field, fieldSettings[field.name]?.manualValue || ''))}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">{formatValue(field, rawValue as SeedValue)}</span>
                                  )}
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

          <div className="sticky bottom-4">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 shadow-2xl">
              <button
                onClick={handleSeedDirect}
                disabled={isLoading}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
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
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    {loadingMessage ?? (progress ? `Đang Seed ${progress.current}/${progress.total} record...` : 'Đang Seed...')}
                  </>
                ) : !pkceAuthService.getConfig() ? (
                  'Cần cấu hình API trước — vào Settings'
                ) : !isAuthenticated ? (
                  'Login để bắt đầu Seed'
                ) : seedMode === 'sequential' ? (
                  'Seed 1 record (Sequential)'
                ) : seedMode === 'concurrent' ? (
                  `Seed ${concurrentCount} record (Concurrent)`
                ) : (
                  `Seed ${count} record (Batch)`
                )}
              </button>

              {result && (
                <div className={`mt-2 rounded-lg text-sm ${
                  result.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}>
                  <div className="p-2 flex items-center gap-2">
                    <span className={`flex-1 ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>{result.message}</span>
                  </div>
                  {resultTimer && (
                    <Progress.Root className="relative overflow-hidden bg-slate-700 h-1" value={progressPercent}>
                      <Progress.Indicator
                        className={`h-full ${result.success ? 'bg-emerald-400' : 'bg-red-400'}`}
                        style={{ width: `${progressPercent}%`, transition: 'width 50ms linear' }}
                      />
                    </Progress.Root>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
        </div>
      </div>
    </>
  );
}
