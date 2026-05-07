import { cn } from '@/lib/utils/cn';

type Variant = 'default' | 'accent' | 'success' | 'warning';

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const variants: Record<Variant, string> = {
    default: 'bg-brand-100 text-brand-700',
    accent: 'bg-accent-50 text-accent-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
