import ResourceSeedPage from '@/components/ResourceSeedPage';

export default async function SeedPage({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  return <ResourceSeedPage resourceId={resourceId} />;
}
