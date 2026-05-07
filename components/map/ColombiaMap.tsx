'use client';

import dynamic from 'next/dynamic';

const ColombiaMapInner = dynamic(() => import('./ColombiaMapInner'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-brand-100 shimmer-bg" />,
});

export function ColombiaMap() {
  return <ColombiaMapInner />;
}
