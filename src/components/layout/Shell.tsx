import { Suspense } from 'react'
import { Navbar } from './Navbar'
import { LocalityTicker } from './LocalityTicker'
import { CompareBar } from './CompareBar'

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink-950 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      <Suspense fallback={<div className="h-8 bg-brand-950" />}>
        <LocalityTicker />
      </Suspense>
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <CompareBar />
      
      {/* Minimal Architectural Footer */}
      <footer className="border-t border-border-subtle bg-white py-8 mt-16 text-xs text-ink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-brand-900">Ivy Homes</span>
            <span>·</span>
            <span>Algorithmic Fair Valuation & 120-Point Technical Verification</span>
          </div>
          <div className="flex items-center gap-4 text-ink-400">
            <span>0% Brokerage</span>
            <span>·</span>
            <span>RERA Registered Properties</span>
            <span>·</span>
            <span>Statutory Stamp Duty & Legal Chain Audited</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
