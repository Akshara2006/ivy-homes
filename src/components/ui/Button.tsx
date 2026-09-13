import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brass'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]',
          {
            // Primary: Deep Ivy Forest Green with refined tactile feel
            'bg-brand-700 text-white hover:bg-brand-800 shadow-sm hover:shadow-atelier':
              variant === 'primary',
            // Secondary: Warm stone with crisp architectural border
            'bg-surface-card text-ink-800 border border-border-medium hover:bg-surface-subtle hover:border-brand-600/40 hover:text-brand-700 shadow-sm':
              variant === 'secondary',
            // Ghost: Subtle hover tone
            'text-ink-600 hover:text-brand-700 hover:bg-surface-subtle':
              variant === 'ghost',
            // Danger
            'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100':
              variant === 'danger',
            // Brass: Investment grade accent
            'bg-brass-500 text-white hover:bg-brass-600 shadow-sm':
              variant === 'brass',
          },
          {
            'text-xs px-2.5 py-1.5 rounded-lg gap-1.5': size === 'sm',
            'text-sm px-4 py-2 rounded-xl gap-2': size === 'md',
            'text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold': size === 'lg',
            'p-2 rounded-xl': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
