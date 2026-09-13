'use client'

import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useCompare } from '@/context/CompareContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Shell } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/Loading'
import { formatPrice, formatArea, capitalize, getBHKLabel } from '@/lib/utils'
import { GitCompareArrows, X, MapPin } from 'lucide-react'
import Link from 'next/link'

interface CompareField {
  key: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format: (v: any) => string
  better: 'lower' | 'higher' | 'none'
}

const COMPARE_FIELDS: CompareField[] = [
  { key: 'price', label: 'Price', format: (v: number) => formatPrice(v), better: 'lower' },
  { key: 'carpet_area', label: 'Carpet Area', format: (v: number) => v > 0 ? formatArea(v) : 'N/A', better: 'higher' },
  { key: 'pricePerSqft', label: 'Price/sq.ft', format: (v: number) => v > 0 ? `₹${v.toLocaleString('en-IN')}` : 'N/A', better: 'lower' },
  { key: 'bedroom', label: 'Bedrooms', format: (v: number) => getBHKLabel(v), better: 'none' },
  { key: 'bathroom', label: 'Bathrooms', format: (v: number) => String(v), better: 'none' },
  { key: 'floor', label: 'Floor Level', format: (v: number) => String(v), better: 'none' },
  { key: 'total_floors', label: 'Total Floors', format: (v: number) => String(v), better: 'none' },
  { key: 'balcony', label: 'Balconies', format: (v: number) => String(v), better: 'higher' },
  { key: 'covered_parking', label: 'Covered Parking', format: (v: number) => String(v), better: 'higher' },
  { key: 'furnishing', label: 'Furnishing', format: (v: string) => capitalize(v), better: 'none' },
  { key: 'property_type', label: 'Type', format: (v: string) => capitalize(v), better: 'none' },
  { key: 'locality', label: 'Micro-Market Locality', format: (v: string) => capitalize(v), better: 'none' },
  { key: 'facing_direction', label: 'Orientation', format: (v: string) => v ? capitalize(v) : 'East (Vastu)', better: 'none' },
]

export default function ComparePage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const { items, removeItem, clearAll } = useCompare()

  if (authLoading) return <PageLoader />
  if (!isLoggedIn) return <LoginForm />

  const enriched = items.map(item => ({
    ...item,
    pricePerSqft: item.carpet_area > 0 ? Math.round(item.price / item.carpet_area) : 0,
  }))

  return (
    <Shell>
      <div className="space-y-6">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-brand-200">
              <GitCompareArrows className="w-3.5 h-3.5 text-brand-600" />
              <span>Investment Comparison Matrix</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-ink-950 tracking-tight">
              Side-by-Side Property Analysis
            </h1>
            <p className="text-sm text-ink-500 mt-1">
              Compare floor ratios, ₹/sq.ft metrics, and verified engineering features.
            </p>
          </div>

          {items.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAll}
              className="text-xs text-red-600 hover:bg-red-50 border-red-200"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear Comparison Tray
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={GitCompareArrows}
            title="No Properties in Compare Tray"
            description="Select up to 3 residences from the Explorer to analyze their ₹/sq.ft and floorplan efficiency."
            action={
              <Link href="/">
                <Button variant="primary">Browse Resale Homes</Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl border border-border-subtle shadow-atelier overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left p-5 w-44 bg-surface-subtle/50 text-xs font-bold uppercase tracking-wider text-ink-500">
                      Metric
                    </th>
                    {enriched.map((item, idx) => (
                      <th key={item.listing_id} className="p-5 text-left min-w-[240px] bg-white border-l border-border-subtle">
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-3 bg-surface-subtle">
                          <Image
                            src={idx % 2 === 0 ? '/images/residence-1.jpg' : '/images/interior-1.jpg'}
                            alt={item.apartment_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/listings/${item.listing_id}`}
                              className="font-serif font-bold text-base text-ink-950 hover:text-brand-700 transition-colors"
                            >
                              {item.apartment_name}
                            </Link>
                            <div className="flex items-center gap-1 text-xs text-ink-500 mt-1">
                              <MapPin className="w-3 h-3 text-brand-600" />
                              <span>{capitalize(item.locality)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.listing_id)}
                            className="text-ink-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2">
                          <span className="text-lg font-bold font-mono text-ink-950">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FIELDS.map(({ key, label, format, better }) => {
                    const values = enriched.map(item => (item as Record<string, unknown>)[key])
                    let bestIdx = -1
                    if (better === 'lower') {
                      const numVals = values.map(Number).filter(v => v > 0)
                      if (numVals.length > 0) {
                        const minVal = Math.min(...numVals)
                        bestIdx = values.findIndex(v => Number(v) === minVal)
                      }
                    } else if (better === 'higher') {
                      const numVals = values.map(Number).filter(v => v > 0)
                      if (numVals.length > 0) {
                        const maxVal = Math.max(...numVals)
                        bestIdx = values.findIndex(v => Number(v) === maxVal)
                      }
                    }

                    return (
                      <tr key={key} className="border-b border-border-subtle/70 hover:bg-surface-subtle/40 transition-colors">
                        <td className="p-4 font-semibold text-xs text-ink-600 uppercase tracking-wide bg-surface-subtle/30">
                          {label}
                        </td>
                        {enriched.map((item, idx) => {
                          const val = (item as Record<string, unknown>)[key]
                          const isBest = idx === bestIdx && enriched.length > 1
                          return (
                            <td
                              key={item.listing_id}
                              className={`p-4 border-l border-border-subtle text-ink-800 ${
                                isBest ? 'bg-emerald-50/50 font-semibold' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={key === 'price' || key === 'pricePerSqft' ? 'font-mono' : ''}>
                                  {format(val)}
                                </span>
                                {isBest && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    Best Value
                                  </span>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
