'use client';

import { Suspense } from 'react';
import { useUrlSync } from '@/lib/store/useUrlSync';
import { useIdleDetector } from '@/lib/hooks/useIdleDetector';

function UrlSyncRunner() {
  useUrlSync();
  useIdleDetector();
  return null;
}

export function UrlSyncBoundary() {
  return (
    <Suspense fallback={null}>
      <UrlSyncRunner />
    </Suspense>
  );
}
