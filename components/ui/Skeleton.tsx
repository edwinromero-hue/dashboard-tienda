import { cn } from '@/lib/utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer-bg rounded-md', className)} aria-hidden />;
}
