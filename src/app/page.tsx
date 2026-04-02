'use client';

import Link from 'next/link';
import { useState } from 'react';
import { VDS_RESOURCES } from '@/lib/vds-resource-config';

const RESOURCE_ICONS: Record<string, string> = {
  'vds-event': 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  'vds-traffic': 'M3 12h3m0 0l3-3m-3 3l3 3m3-6h8m-8 6h8',
  'vds-vehicle': 'M3 13l1-4a2 2 0 012-1.5h8a2 2 0 012 1.5l1 4M5 13h14m-1 0v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H9v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4m1-3h.01M17 10h.01',
};

export default function Home() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  if (selectedResource) {
    window.location.href = `/seed/${selectedResource}`;
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Công cụ nạp dữ liệu mẫu</h1>
                <p className="text-sm text-slate-400">Chọn loại dữ liệu cần nạp</p>
              </div>
            </div>
            <Link
              href="/get-started"
              className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all text-sm border border-blue-500/30"
            >
              Hướng dẫn
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VDS_RESOURCES.map((resource) => (
            <button
              key={resource.id}
              onClick={() => setSelectedResource(resource.id)}
              className="group p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={RESOURCE_ICONS[resource.id]} />
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
                  Nhấn để bắt đầu →
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
