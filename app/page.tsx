import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MainCanvas } from '@/components/MainCanvas';
import { RightPanel } from '@/components/panel/RightPanel';
import { UrlSyncBoundary } from '@/components/UrlSyncBoundary';

export default function HomePage() {
  return (
    <>
      <UrlSyncBoundary />
      <DashboardLayout main={<MainCanvas />} panel={<RightPanel />} />
    </>
  );
}
