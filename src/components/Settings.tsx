'use client';

import { useState, useEffect } from 'react';
import { pkceAuthService } from '@/lib/auth-pkce';
import { PKCEConfig } from '@/types/auth-pkce';

interface SettingsProps {
  onClose: () => void;
}

const AVAILABLE_SCOPES = [
  { value: 'MonoTemplate', label: 'MonoTemplate' },
  { value: 'MasterData', label: 'MasterData' },
  { value: 'Master', label: 'Master' },
  { value: 'VDS', label: 'VDS' },
  { value: 'CMMS', label: 'CMMS' },
  { value: 'Core', label: 'Core' },
  { value: 'profile', label: 'Profile' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'role', label: 'Role' },
  { value: 'permission', label: 'Permission' },
  { value: 'address', label: 'Address' },
];

const getDefaultRedirectUri = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/callback`;
  }
  return 'http://localhost:3000/callback';
};

const DEFAULT_CONFIG = {
  authUrl: 'http://localhost:7001/',
  backendApiUrl: 'http://localhost:7001/',
  clientId: 'SeedingTool',
  redirectUri: getDefaultRedirectUri(),
  scopes: 'MonoTemplate',
};

export default function Settings({ onClose }: SettingsProps) {
  const [authUrl, setAuthUrl] = useState(DEFAULT_CONFIG.authUrl);
  const [backendApiUrl, setBackendApiUrl] = useState(DEFAULT_CONFIG.backendApiUrl);
  const [clientId, setClientId] = useState(DEFAULT_CONFIG.clientId);
  const [redirectUri, setRedirectUri] = useState(DEFAULT_CONFIG.redirectUri);
  const [scopes, setScopes] = useState(DEFAULT_CONFIG.scopes);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const config = pkceAuthService.getConfig();
    if (config) {
      setAuthUrl(config.authUrl);
      setBackendApiUrl(config.backendApiUrl);
      setClientId(config.clientId);
      setRedirectUri(config.redirectUri);
      setScopes(config.scopes);
    }
  }, []);

  const handleSave = () => {
    const currentScopes = scopes.split(' ').filter(s => s);
    currentScopes.unshift('openid', 'offline_access');

    const config: PKCEConfig = {
      authUrl: authUrl.replace(/\/$/, ''),
      backendApiUrl: backendApiUrl.replace(/\/$/, ''),
      clientId,
      redirectUri,
      scopes: [...new Set(currentScopes)].join(' '),
    };

    pkceAuthService.setConfig(config);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!authUrl) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const discoveryUrl = `${authUrl.replace(/\/$/, '')}/.well-known/openid-configuration`;
      const response = await fetch(discoveryUrl, { method: 'GET' });

      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful' });
      } else {
        setTestResult({ success: false, message: `Server returned ${response.status}` });
      }
    } catch {
      setTestResult({ success: false, message: 'Connection failed' });
    }

    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Auth Server URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Auth Server URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={authUrl}
              onChange={(e) => setAuthUrl(e.target.value)}
              placeholder="https://auth.example.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Backend API URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Backend API URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={backendApiUrl}
              onChange={(e) => setBackendApiUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Client ID */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Client ID <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="SeedingTool"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Redirect URI */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Redirect URI <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Scopes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Scopes <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-slate-900 border border-slate-600 rounded-xl p-3">
              {AVAILABLE_SCOPES.map((scope) => {
                const isSelected = scopes.split(' ').includes(scope.value);
                return (
                  <label
                    key={scope.value}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentScopes = scopes.split(' ').filter(s => s);
                        if (e.target.checked) {
                          setScopes([...currentScopes, scope.value].join(' '));
                        } else {
                          setScopes(currentScopes.filter(s => s !== scope.value).join(' '));
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900 bg-slate-800"
                    />
                    <span className={`text-sm ${isSelected ? 'text-blue-300' : 'text-slate-400'}`}>{scope.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Test Connection */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={!authUrl || isTesting}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-white animate-spin"></div>
                  Testing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Test Connection
                </>
              )}
            </button>
            {testResult && (
              <div className={`mt-2 flex items-center gap-2 text-sm ${
                testResult.success ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {testResult.success ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!authUrl || !backendApiUrl || !clientId || !redirectUri}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
