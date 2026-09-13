'use client'

import Link from 'next/link'
import { useCompare } from '@/context/CompareContext'
import { X, GitCompareArrows, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export function CompareBar() {
  const { items, removeItem, clearAll } = useCompare()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-fade-in-up">
      <div className="pointer-events-auto bg-brand-950 text-white border border-brand-800/80 rounded-2xl p-3 shadow-atelier-modal flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-2xl w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-800 text-brass-400 flex items-center justify-center shrink-0">
            <GitCompareArrows className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold font-serif text-white tracking-wide">
              Property Compare Studio
            </div>
            <div className="text-[11px] text-brand-300">
              {items.length} of 3 properties selected
            </div>
          </div>
        </div>

        {/* Selected property pills */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
          {items.map((item) => (
            <div
              key={item.listing_id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-900 border border-brand-800 text-xs text-white shrink-0"
            >
              <span className="truncate max-w-[110px] font-medium">{item.apartment_name}</span>
              <span className="text-[10px] text-brass-400 font-mono">{formatPrice(item.price)}</span>
              <button
                onClick={() => removeItem(item.listing_id)}
                className="text-brand-400 hover:text-white ml-0.5 cursor-pointer"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={clearAll}
            className="text-[11px] text-brand-300 hover:text-white px-2 py-1 cursor-pointer transition-colors"
          >
            Clear
          </button>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brass-500 hover:bg-brass-600 text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
