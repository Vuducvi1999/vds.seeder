'use client';

import ProtectedLayout from '@/components/ProtectedLayout';

export default function SeedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}