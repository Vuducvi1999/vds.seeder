'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { pkceAuthService } from '@/lib/auth-pkce';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || errorParam);
        setLoading(false);
        return;
      }

      if (!code || !state) {
        setError('Thiếu mã xác thực hoặc trạng thái từ máy chủ');
        setLoading(false);
        return;
      }

      try {
        const success = await pkceAuthService.handleCallback(code, state);
        if (success) {
          router.replace('/');
        } else {
          setError('Không thể đổi mã xác thực lấy token');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      }

      setLoading(false);
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang xử lý đăng nhập</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
        </>
      ) : error ? (
        <>
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đăng nhập thất bại</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.replace('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Quay về trang chủ
          </button>
        </>
      ) : (
        <>
          <div className="text-green-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đăng nhập thành công</h2>
          <p className="text-gray-600">Đang chuyển hướng...</p>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang tải...</h2>
      <p className="text-gray-600">Vui lòng chờ...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<LoadingFallback />}>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
