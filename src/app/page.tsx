'use client'

import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getListings } from '@/lib/api'
import { Shell } from '@/components/layout/Shell'
import { ListingCard } from '@/components/listings/ListingCard'
import { ListingTerminalRow } from '@/components/listings/ListingTerminalRow'
import { ListingFiltersBar } from '@/components/listings/ListingFiltersBar'
import { Pagination } from '@/components/listings/Pagination'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchX, ShieldCheck, AlertCircle } from 'lucide-react'
import type { ListingFilters } from '@/lib/types'

const PAGE_SIZE = 12

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({})
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['listings', filters, page],
    queryFn: () => getListings(filters, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  })

  // Data strictly fetched from the Ivy Homes API
  const listings = data?.results || []
  const total = data?.total || 0
  const pageSize = data?.page_size || PAGE_SIZE
  const totalPages = Math.ceil(total / pageSize)

  return (
    <Shell>
      {/* Editorial Hero Section */}
      <div className="mb-8 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-brand-200">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Verified Resale Atelier · 0% Brokerage</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink-950 tracking-tight leading-[1.15]">
              Curated Verified Residences, Evaluated with Engineering Precision.
            </h1>
            <p className="text-sm sm:text-base text-ink-600 mt-3 leading-relaxed">
              Every home on Ivy is pre-screened with a 120-point structural inspection, thermal dampness scan, and clean title chain. Transparent pricing without broker markup.
            </p>
          </div>

          {/* Real-time stats directly from API */}
          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="p-3.5 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] text-ink-500 uppercase font-bold tracking-wider block">Audited Listings</span>
              <span className="text-xl font-bold font-mono text-ink-950 block mt-0.5">
                {total.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] text-ink-500 uppercase font-bold tracking-wider block">Current Page</span>
              <span className="text-xl font-bold font-mono text-brand-700 block mt-0.5">
                {page} / {Math.max(1, totalPages)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Matrix */}
      <ListingFiltersBar
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters)
          setPage(1)
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Listings Content */}
      {isLoading ? (
        <PageLoader message="Fetching verified listings from API..." />
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Listings"
          description={error instanceof Error ? error.message : 'An error occurred while communicating with the property API.'}
        />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No Matching Residences Found"
          description="Try adjusting your budget slider, bedroom configuration, or locality criteria."
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, idx) => (
            <ListingCard key={listing.listing_id} listing={listing} index={idx} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border-subtle shadow-atelier overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-subtle/80 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-600">
                  <th className="py-3 px-3 w-10">Comp</th>
                  <th className="py-3 px-3">Apartment & Locality</th>
                  <th className="py-3 px-3">BHK</th>
                  <th className="py-3 px-3">Carpet Area</th>
                  <th className="py-3 px-3">Price & ₹/Sq.Ft</th>
                  <th className="py-3 px-3">Floor & Orientation</th>
                  <th className="py-3 px-3">Inspection Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <ListingTerminalRow key={listing.listing_id} listing={listing} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Shell>
  )
}
