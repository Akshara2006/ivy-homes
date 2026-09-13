import { Spinner } from './Spinner'

export function PageLoader({ message = 'Loading verified properties...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Spinner size="lg" />
      <span className="text-xs font-semibold text-ink-500 tracking-wide font-sans">{message}</span>
    </div>
  )
}
