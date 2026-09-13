import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-border-subtle shadow-atelier max-w-lg mx-auto my-8 animate-fade-in-up">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface-subtle border border-border-medium flex items-center justify-center text-brand-700">
        <Icon className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold text-ink-900 font-serif">{title}</h3>
      {description && <p className="text-sm text-ink-500 mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
