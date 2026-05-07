'use client';

import { cn } from '@/lib/utils/cn';
import { useIdleStore } from '@/lib/store/useIdleStore';

export function DashboardLayout({
  main,
  panel,
}: {
  main: React.ReactNode;
  panel: React.ReactNode;
}) {
  const idle = useIdleStore((s) => s.idle);

  return (
    <div
      className={cn(
        'h-screen w-screen overflow-hidden bg-brand-50',
        'grid grid-cols-1 grid-rows-[auto_1fr] md:grid-rows-1',
        'transition-[grid-template-columns,padding,gap] duration-700 ease-in-out',
        idle
          ? 'gap-0 p-0 md:grid-cols-[0%_100%]'
          : 'gap-3 p-3 md:gap-5 md:p-4 md:grid-cols-[28%_72%]',
      )}
    >
      <aside
        className={cn(
          'order-2 min-h-0 overflow-y-auto md:order-1',
          'transition-all duration-700 ease-in-out',
          idle && 'pointer-events-none -translate-x-6 opacity-0',
        )}
      >
        {panel}
      </aside>
      <main className="relative order-1 h-full min-h-0 overflow-hidden md:order-2">
        {main}
      </main>
    </div>
  );
}
