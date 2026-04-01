import VdsEventSeeder from '@/components/VdsEventSeeder';
import Link from 'next/link';

const RESOURCES: Record<string, { name: string; description: string }> = {
  'vds-event': {
    name: 'VDS Event',
    description: 'Dữ liệu sự kiện từ hệ thống phát hiện phương tiện (VDS)',
  },
};

export default async function SeedPage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const resource = RESOURCES[resourceId];

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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return <VdsEventSeeder />;
}
