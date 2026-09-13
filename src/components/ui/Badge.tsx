import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'brass' | 'ivy'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full tracking-wide transition-colors',
        {
          'bg-surface-subtle text-ink-700 border border-border-subtle': variant === 'default',
          'bg-brand-50 text-brand-700 border border-brand-200/80': variant === 'green' || variant === 'ivy',
          'bg-sky-50 text-sky-800 border border-sky-200': variant === 'blue',
          'bg-amber-50 text-amber-800 border border-amber-200': variant === 'amber',
          'bg-red-50 text-red-700 border border-red-200': variant === 'red',
          'bg-purple-50 text-purple-800 border border-purple-200': variant === 'purple',
          'bg-brass-100 text-brass-700 border border-brass-300': variant === 'brass',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
