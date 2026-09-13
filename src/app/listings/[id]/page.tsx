'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { getListing, getSimilarListings } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Shell } from '@/components/layout/Shell'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { ListingCard } from '@/components/listings/ListingCard'
import { InspectionModal } from '@/components/listings/InspectionModal'
import { useFavourite } from '@/hooks/useFavourite'
import { formatPrice, formatArea, capitalize, getBHKLabel } from '@/lib/utils'
import {
  ArrowLeft, MapPin,
  Heart, Building, Phone, Share2, Calculator,
  ShieldCheck, CheckCircle2,
} from 'lucide-react'

export default function ListingDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const { isFav, toggle, isPending } = useFavourite(id)
  const [showInspection, setShowInspection] = useState(false)

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id),
    enabled: isLoggedIn && !!id,
    retry: 1,
  })

  const { data: similar = [] } = useQuery({
    queryKey: ['similar', id],
    queryFn: () => getSimilarListings(id),
    enabled: isLoggedIn && !!id,
    retry: 1,
  })

  if (authLoading) return <PageLoader />
  if (!isLoggedIn) return <LoginForm />

  if (isLoading) {
    return (
      <Shell>
        <PageLoader message="Fetching property details from API..." />
      </Shell>
    )
  }

  if (error || !listing) {
    return (
      <Shell>
        <EmptyState
          icon={Building}
          title="Listing Not Found"
          description={error instanceof Error ? error.message : 'This property record could not be retrieved from the API.'}
          action={
            <Button variant="secondary" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Listings
            </Button>
          }
        />
      </Shell>
    )
  }

  const carpetArea = listing.carpet_area || 0
  const superArea = listing.super_built_up_area || listing.super_builtup_area || 0
  const carpetEfficiency = superArea > 0 && carpetArea > 0 ? Math.round((carpetArea / superArea) * 100) : 0
  const pricePerSqft = carpetArea > 0 ? Math.round(listing.price / carpetArea) : 0

  return (
    <Shell>
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-xs text-ink-600">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Explorer</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggle}
            disabled={isPending}
            className="text-xs"
          >
            <Heart className={`w-3.5 h-3.5 mr-1 ${isFav ? 'fill-red-500 text-red-500' : 'text-ink-600'}`} />
            <span>{isFav ? 'Saved' : 'Save Property'}</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: listing.apartment_name, url: window.location.href })
              }
            }}
            className="text-xs"
          >
            <Share2 className="w-3.5 h-3.5 mr-1 text-ink-600" />
            <span>Share</span>
          </Button>
        </div>
      </div>

      {/* Main Monograph Hero Showcase */}
      <div className="relative w-full aspect-[21/9] min-h-[300px] max-h-[460px] rounded-3xl overflow-hidden shadow-atelier mb-8 border border-border-subtle bg-surface-subtle">
        <Image
          src="/images/residence-1.jpg"
          alt={listing.apartment_name || 'Architectural Residence'}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Hero Overlay Data */}
        <div className="absolute bottom-6 inset-x-6 sm:inset-x-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-900/90 text-brass-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-2 border border-brand-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-brass-400" />
              <span>Ivy Verified™ Architectural Residence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              {listing.apartment_name || 'Bespoke Residence'}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-brand-100">
              <MapPin className="w-4 h-4 text-brass-400" />
              <span>{capitalize(listing.locality)}</span>
              {listing.floor && (
                <>
                  <span>·</span>
                  <span>Floor {listing.floor} of {listing.total_floors || '—'}</span>
                </>
              )}
              {listing.facing_direction && (
                <>
                  <span>·</span>
                  <span>{capitalize(listing.facing_direction)} Facing</span>
                </>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white block">
              {formatPrice(listing.price)}
            </span>
            {pricePerSqft > 0 && (
              <span className="text-xs font-mono text-brand-200 block mt-0.5">
                ₹{pricePerSqft.toLocaleString('en-IN')}/sq.ft (Carpet)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Specifications & Inspection vs Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Specification Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Architectural Key Figures */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">Configuration</span>
              <span className="text-lg font-serif font-bold text-ink-950 block mt-1">{getBHKLabel(listing.bedroom)}</span>
              <span className="text-xs text-ink-500">{listing.bathroom || 2} Baths</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">Carpet Area</span>
              <span className="text-lg font-mono font-bold text-ink-950 block mt-1">{formatArea(carpetArea)}</span>
              {carpetEfficiency > 0 && (
                <span className="text-xs text-brand-700 font-semibold">{carpetEfficiency}% efficiency</span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">Orientation</span>
              <span className="text-lg font-serif font-bold text-ink-950 block mt-1">{listing.facing_direction ? capitalize(listing.facing_direction) : 'Standard'}</span>
              <span className="text-xs text-emerald-700 font-medium">Vastu Verified</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">Covered Parking</span>
              <span className="text-lg font-mono font-bold text-ink-950 block mt-1">{listing.covered_parking || 1} Vehicle(s)</span>
              <span className="text-xs text-ink-500">Dedicated Stall</span>
            </div>
          </div>

          {/* Ivy 120-Point Inspection Scorecard */}
          <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-atelier">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Engineering Audit
                </div>
                <h2 className="text-xl font-serif font-bold text-ink-950">
                  Ivy 120-Point Technical Verification Scorecard
                </h2>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowInspection(true)}
                className="text-xs shrink-0"
              >
                <Calculator className="w-3.5 h-3.5 mr-1 text-brass-400" />
                <span>Open Full Audit & EMI</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs text-ink-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink-900 block">Thermal Seepage Scan</span>
                  <span className="text-ink-500">FLIR thermal camera imaging verified no moisture ingress in ceiling/walls.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink-900 block">Legal Title Chain Audit</span>
                  <span className="text-ink-500">Mother deed, Encumbrance Certificate, and Occupancy Certificate verified clear.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink-900 block">Structural Load-Bearing Grade</span>
                  <span className="text-ink-500">Certified Grade A RCC structure with zero settlement or structural fractures.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink-900 block">Plumbing Hydrostatic Pressure</span>
                  <span className="text-ink-500">Pressure tested with zero joint leakage across all kitchen and bathroom lines.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description directly from API */}
          {listing.description && (
            <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-atelier">
              <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">
                Property Description
              </h2>
              <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Action & Contact Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-atelier sticky top-24">
            <span className="text-xs uppercase font-bold tracking-wider text-brand-700 block mb-1">
              Verified Pricing
            </span>
            <div className="text-3xl font-bold font-mono text-ink-950">
              {formatPrice(listing.price)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-ink-500 font-mono">
              {pricePerSqft > 0 && <span>₹{pricePerSqft.toLocaleString('en-IN')}/sqft</span>}
              <span>·</span>
              <span className="text-emerald-700 font-semibold font-sans">0% Brokerage</span>
            </div>

            <div className="mt-6 pt-5 border-t border-border-subtle space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowInspection(true)}
                className="w-full font-bold shadow-atelier"
              >
                Inspect 120-Point Audit
              </Button>
              {listing.posted_by_contact && (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full text-xs"
                  onClick={() => alert(`Direct Contact: ${listing.posted_by_contact}`)}
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Contact {listing.posted_by_name || 'Lister'} ({listing.posted_by || 'Verified'})
                </Button>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-border-subtle space-y-2 text-xs text-ink-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Verified Clean Legal Title</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Zero Broker Commission</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Direct Owner/Builder Coordination</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Curated Properties */}
      {similar.length > 0 && (
        <div className="mt-16 pt-10 border-t border-border-subtle">
          <h2 className="text-2xl font-serif font-bold text-ink-950 mb-6">
            Similar Residences in {capitalize(listing.locality)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similar.slice(0, 3).map((item, idx) => (
              <ListingCard key={item.listing_id} listing={item} index={idx} />
            ))}
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      <InspectionModal
        listing={listing}
        isOpen={showInspection}
        onClose={() => setShowInspection(false)}
      />
    </Shell>
  )
}
