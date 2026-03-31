'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { pkceAuthService } from '@/lib/auth-pkce';
import Settings from '@/components/Settings';

interface Resource {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const RESOURCES: Resource[] = [
  {
    id: 'vds-event',
    name: 'VDS Event',
    description: 'Video Detection System Event Data',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
];

export default function Home() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    pkceAuthService.init();
    const authState = pkceAuthService.getAuthState();
    setIsAuthenticated(authState.isAuthenticated);
    setUser(authState.user);
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

  if (selectedResource) {
    if (!isAuthenticated) {
      window.location.href = `/?requireAuth=true`;
      return null;
    }
    window.location.href = `/seed/${selectedResource}`;
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Data Seeder</h1>
                <p className="text-sm text-slate-400">Select a resource to seed data</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cài đặt
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isAuthenticated && (
          <div className="mb-8 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
            <div className="flex items-center gap-3 mb-3">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-amber-400 font-medium">Yêu cầu đăng nhập</span>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              Bạn cần đăng nhập để sử dụng các tính năng seed data. Vui lòng đăng nhập để tiếp tục.
            </p>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Đăng nhập
            </button>
          </div>
        )}

        {isAuthenticated && user && (
          <div className="mb-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-medium">
                    {user.name?.[0] || user.email?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.name || user.email}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm border border-red-500/30"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <>
            {/* Hướng dẫn sử dụng */}
            <section className="mb-8">
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">Hướng dẫn</h2>
          <Link
            href="/get-started"
            className="group flex items-center gap-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 hover:border-amber-400/50 hover:bg-amber-500/20 transition-all"
          >
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
                Hướng dẫn sử dụng
              </h3>
              <p className="text-sm text-slate-400 mt-1">Tìm hiểu cách sử dụng Data Seeder từ cơ bản đến nâng cao</p>
            </div>
            <div className="flex items-center">
              <span className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </section>

        {/* Resources */}
        <section>
          <h2 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCES.map((resource) => (
            <button
              key={resource.id}
              onClick={() => setSelectedResource(resource.id)}
              className="group p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={resource.icon} />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {resource.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to seed →
                </span>
              </div>
            </button>
          ))}
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}
