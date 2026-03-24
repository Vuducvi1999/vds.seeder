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
  rootUrl: 'http://localhost:7001/',
  clientId: 'SeedingTool',
  redirectUri: getDefaultRedirectUri(),
  scopes: 'MonoTemplate',
};

export default function Settings({ onClose }: SettingsProps) {
  const [rootUrl, setRootUrl] = useState(DEFAULT_CONFIG.rootUrl);
  const [clientId, setClientId] = useState(DEFAULT_CONFIG.clientId);
  const [redirectUri, setRedirectUri] = useState(DEFAULT_CONFIG.redirectUri);
  const [scopes, setScopes] = useState(DEFAULT_CONFIG.scopes);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const config = pkceAuthService.getConfig();
    if (config) {
      setRootUrl(config.rootUrl);
      setClientId(config.clientId);
      setRedirectUri(config.redirectUri);
      setScopes(config.scopes);
    }
  }, []);

  const handleSave = () => {
    const currentScopes = scopes.split(' ').filter(s => s);
    currentScopes.unshift('openid', 'offline_access');

    const config: PKCEConfig = {
      rootUrl: rootUrl.replace(/\/$/, ''),
      clientId,
      redirectUri,
      scopes: [...new Set(currentScopes)].join(' '),
    };

    pkceAuthService.setConfig(config);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!rootUrl) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const discoveryUrl = `${rootUrl.replace(/\/$/, '')}/.well-known/openid-configuration`;
      const response = await fetch(discoveryUrl, { method: 'GET' });

      if (response.ok) {
        setTestResult({ success: true, message: 'OpenIddict connection successful' });
      } else {
        setTestResult({ success: false, message: `Server returned ${response.status}` });
      }
    } catch {
      setTestResult({ success: false, message: 'Connection failed' });
    }

    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Server Root URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={rootUrl}
              onChange={(e) => setRootUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">OpenIddict server URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">OAuth 2.0 Client ID registered in OpenIddict</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redirect URI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Must match the redirect URI registered in OpenIddict</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scopes <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
              {AVAILABLE_SCOPES.map((scope) => (
                <label
                  key={scope.value}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={scopes.split(' ').includes(scope.value)}
                    onChange={(e) => {
                      const currentScopes = scopes.split(' ').filter(s => s);
                      if (e.target.checked) {
                        setScopes([...currentScopes, scope.value].join(' '));
                      } else {
                        setScopes(currentScopes.filter(s => s !== scope.value).join(' '));
                      }
                    }}
                    className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{scope.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <button
              onClick={handleTestConnection}
              disabled={!rootUrl || isTesting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            {testResult && (
              <span className={`ml-4 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!rootUrl || !clientId || !redirectUri}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
