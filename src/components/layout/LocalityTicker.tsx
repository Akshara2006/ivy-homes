'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { getAnalyticsSummary } from '@/lib/api'
import { useLocalities } from '@/hooks/useLocalities'
import { capitalize } from '@/lib/utils'

export function LocalityTicker() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentLocality = searchParams.get('locality')

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: getAnalyticsSummary,
    staleTime: 300_000,
    retry: 1,
  })

  const { data: dynamicLocalities = [] } = useLocalities()

  // Derive real ticker items directly from API analytics or discovered localities
  const tickerItems = summary?.by_locality && summary.by_locality.length > 0
    ? summary.by_locality.map((item) => ({
        raw: item.locality,
        name: capitalize(item.locality),
        price: `Median ₹${(item.median_price / 100000).toFixed(0)}L`,
        trend: `${item.count} units`,
      }))
    : dynamicLocalities.map((loc) => ({
        raw: loc,
        name: capitalize(loc),
        price: 'Verified',
        trend: 'Live',
      }))

  const handleSelect = (locRaw: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentLocality?.toLowerCase() === locRaw.toLowerCase()) {
      params.delete('locality')
    } else {
      params.set('locality', locRaw.toLowerCase())
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="bg-brand-950 text-white text-xs border-b border-brand-900/50 py-2 overflow-hidden select-none relative z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left permanent badge */}
        <div className="hidden md:flex items-center gap-2 pr-4 border-r border-brand-800/80 shrink-0 font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-brand-200">Micro-Market Price Index</span>
        </div>

        {/* Scrolling or interactive track */}
        <div className="flex-1 overflow-x-auto no-scrollbar py-0.5 px-3 flex items-center gap-3 md:gap-5 text-ink-300">
          {tickerItems.length === 0 ? (
            <div className="flex items-center gap-2 text-ink-400 text-[11px] py-0.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-brass-400" />
              <span>Syncing live micro-markets from property API...</span>
            </div>
          ) : (
            tickerItems.map((loc) => {
              const isSelected = currentLocality?.toLowerCase() === loc.raw.toLowerCase()
              return (
                <button
                  key={loc.raw}
                  onClick={() => handleSelect(loc.raw)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-brass-500 text-white font-semibold'
                      : 'bg-brand-900/60 hover:bg-brand-800/90 text-brand-100 hover:text-white border border-brand-800/60'
                  }`}
                  title={`Filter by ${loc.name}`}
                >
                  <span>{loc.name}</span>
                  <span className="font-mono text-[11px] opacity-80">{loc.price}</span>
                  <span className="text-[10px] text-emerald-400 font-mono hidden sm:inline">{loc.trend}</span>
                </button>
              )
            })
          )}
        </div>

        {/* Right guarantee */}
        <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-brand-800/80 shrink-0 text-brand-200 text-[11px]">
          <Sparkles className="w-3 h-3 text-brass-400" />
          <span>120-Point Inspected · 0% Brokerage</span>
        </div>
      </div>
    </div>
  )
}
