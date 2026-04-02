'use client';

import Link from 'next/link';
import VdsResourceSeeder from '@/components/VdsResourceSeeder';
import { getVdsResourceConfig } from '@/lib/vds-resource-config';

interface Props {
  resourceId: string;
}

export default function ResourceSeedPage({ resourceId }: Props) {
  const resource = getVdsResourceConfig(resourceId);

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Không tìm thấy loại dữ liệu</h1>
          <p className="text-slate-400 mb-4">Loại dữ liệu &quot;{resourceId}&quot; không tồn tại.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return <VdsResourceSeeder config={resource as never} />;
}
