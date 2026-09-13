'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { getRentals } from '@/lib/api'
import { Shell } from '@/components/layout/Shell'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/listings/Pagination'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { useLocalities } from '@/hooks/useLocalities'
import { formatRent, formatArea, capitalize, getBHKLabel } from '@/lib/utils'
import { MapPin, Bed, Bath, Maximize2, X, KeyRound, ShieldCheck, ArrowUpRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { RentalFilters } from '@/lib/types'

const PAGE_SIZE = 12

export default function RentalsPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<RentalFilters>({})
  const { data: localities = [] } = useLocalities()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['rentals', filters, page],
    queryFn: () => getRentals(filters, page, PAGE_SIZE),
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
  })

  if (authLoading) return <PageLoader />
  if (!isLoggedIn) return <LoginForm />

  // Data strictly from API
  const rentals = data?.results || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '')

  return (
    <Shell>
      {/* Editorial Hero Header */}
      <div className="mb-8 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border-subtle">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-3 border border-brand-200">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Executive Rentals · Zero Brokerage</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink-950 tracking-tight leading-[1.15]">
              Executive Homes & Curated Rentals.
            </h1>
            <p className="text-sm sm:text-base text-ink-600 mt-3 leading-relaxed">
              Pre-inspected rental properties with verified pricing, transparent security deposits, and standardized digital lease agreements.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="p-3.5 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] text-ink-500 uppercase font-bold tracking-wider block">Available Units</span>
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

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-border-subtle p-4 shadow-atelier mb-6 flex flex-wrap items-center gap-3">
        <div className="w-48">
          <Select
            id="filter-locality"
            value={filters.locality || ''}
            onChange={(e) => setFilters({ ...filters, locality: e.target.value || undefined })}
            placeholder="All Localities"
            options={localities.map((l) => ({ value: l, label: capitalize(l) }))}
          />
        </div>

        <div className="w-36">
          <Select
            id="filter-bhk"
            value={filters.bhk ? String(filters.bhk) : ''}
            onChange={(e) => setFilters({ ...filters, bhk: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Any BHK"
            options={[
              { value: '1', label: '1 BHK' },
              { value: '2', label: '2 BHK' },
              { value: '3', label: '3 BHK' },
              { value: '4', label: '4+ BHK' },
            ]}
          />
        </div>

        <div className="w-44">
          <Select
            id="filter-furnishing"
            value={filters.furnishing || ''}
            onChange={(e) => setFilters({ ...filters, furnishing: e.target.value || undefined })}
            placeholder="Any Furnishing"
            options={[
              { value: 'unfurnished', label: 'Unfurnished' },
              { value: 'semi-furnished', label: 'Semi-Furnished' },
              { value: 'fully-furnished', label: 'Fully Furnished' },
            ]}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="text-xs text-ink-500 hover:text-red-600">
            <X className="w-3.5 h-3.5 mr-1" /> Reset
          </Button>
        )}
      </div>

      {/* Rentals Content */}
      {isLoading ? (
        <PageLoader message="Fetching rentals from API..." />
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Rentals"
          description={error instanceof Error ? error.message : 'An error occurred while communicating with the rentals API.'}
        />
      ) : rentals.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          title="No Rentals Found"
          description="Try adjusting your bedroom or locality filters to browse available properties."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((rental, idx) => (
            <Card key={rental.listing_id} hover className="overflow-hidden bg-white border border-border-subtle rounded-2xl shadow-atelier flex flex-col justify-between">
              {/* Cover Preview */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                <Image
                  src={idx % 2 === 0 ? '/images/interior-1.jpg' : '/images/terrace-1.jpg'}
                  alt={rental.title || rental.apartment_name || 'Rental Residence'}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-950/90 text-white backdrop-blur-md border border-brand-700/50">
                    <ShieldCheck className="w-3 h-3 text-brass-400" />
                    Verified Lease
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="text-[11px] font-medium text-white/95 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md">
                    {rental.floor ? `Floor ${rental.floor}/${rental.total_floors || '—'}` : 'Ready to Move'} · {capitalize(rental.furnishing || 'Furnished')}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink-950 truncate hover:text-brand-700 transition-colors">
                    {rental.title || rental.apartment_name || 'Rental Residence'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-500">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="font-medium">{capitalize(rental.locality)}</span>
                  </div>

                  {/* Rent and Deposit */}
                  <div className="mt-3.5 pt-3 border-t border-border-subtle/70 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold font-mono text-ink-950">
                        {formatRent(rental.price)}
                      </span>
                      {rental.deposit > 0 && (
                        <span className="text-xs font-mono text-ink-500 ml-2">
                          Deposit: {formatRent(rental.deposit)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      0 Brokerage
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-border-subtle/70 text-xs text-ink-700">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-ink-400" />
                      <span className="font-semibold">{getBHKLabel(rental.bedroom)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-3.5 h-3.5 text-ink-400" />
                      <span>{rental.bathroom || 1} Baths</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-ink-400" />
                      <span className="font-mono">{formatArea(rental.carpet_area)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between">
                  <span className="text-xs text-ink-500">
                    {rental.maintenance > 0 ? (
                      <>Maintenance: <span className="font-mono font-medium">{formatRent(rental.maintenance)}</span></>
                    ) : (
                      'Maintenance Included'
                    )}
                  </span>
                  {rental.posted_by_contact && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs font-semibold text-brand-800 hover:text-brand-900"
                      onClick={() => alert(`Direct Contact: ${rental.posted_by_contact}`)}
                    >
                      Contact
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Shell>
  )
}
