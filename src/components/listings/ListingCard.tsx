'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { formatPrice, formatArea, capitalize, getBHKLabel } from '@/lib/utils'
import { Heart, MapPin, Bed, Bath, Maximize2, ShieldCheck, GitCompareArrows, ArrowUpRight } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { useFavourite } from '@/hooks/useFavourite'
import { useCompare } from '@/context/CompareContext'
import { InspectionModal } from './InspectionModal'

interface Props {
  listing: Listing
  index?: number
}

// Curated architectural photos based on listing index for visual depth
const ARCHITECTURAL_COVERS = [
  '/images/residence-1.jpg',
  '/images/interior-1.jpg',
  '/images/terrace-1.jpg',
]

export function ListingCard({ listing, index = 0 }: Props) {
  const { isFav, toggle, isPending } = useFavourite(listing.listing_id)
  const { addItem, removeItem, isInCompare, isFull } = useCompare()
  const [showInspection, setShowInspection] = useState(false)
  const inCompare = isInCompare(listing.listing_id)

  const coverImage = ARCHITECTURAL_COVERS[index % ARCHITECTURAL_COVERS.length]

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCompare) {
      removeItem(listing.listing_id)
    } else {
      addItem(listing)
    }
  }

  const pricePerSqft = listing.carpet_area > 0 ? Math.round(listing.price / listing.carpet_area) : 0
  const carpetRatio =
    listing.super_built_up_area && listing.carpet_area
      ? Math.round((listing.carpet_area / listing.super_built_up_area) * 100)
      : listing.super_builtup_area && listing.carpet_area
      ? Math.round((listing.carpet_area / listing.super_builtup_area) * 100)
      : 78

  return (
    <>
      <Card
        hover
        className="group flex flex-col overflow-hidden bg-white border border-border-subtle rounded-2xl shadow-atelier transition-all duration-300 hover:-translate-y-1 hover:shadow-atelier-hover"
      >
        {/* Architectural Imagery Cover */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
          <Link href={`/listings/${listing.listing_id}`} className="relative block w-full h-full">
            <Image
              src={coverImage}
              alt={listing.apartment_name || 'Architectural Residence'}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>

          {/* Top badges bar */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-brand-900/90 text-white backdrop-blur-md border border-brand-700/50 shadow-sm">
                <ShieldCheck className="w-3 h-3 text-brass-400" />
                Ivy Verified™
              </span>
              {carpetRatio >= 75 && (
                <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 text-ink-800 backdrop-blur-md border border-border-subtle shadow-sm">
                  {carpetRatio}% Usable
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={handleCompare}
                disabled={isFull && !inCompare}
                title={inCompare ? 'Remove from compare' : isFull ? 'Compare tray full (max 3)' : 'Add to compare'}
                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                  inCompare
                    ? 'bg-brand-700 text-white shadow-md'
                    : 'bg-white/90 text-ink-600 hover:bg-white hover:text-brand-700 border border-white/40 shadow-sm'
                }`}
              >
                <GitCompareArrows className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggle()
                }}
                disabled={isPending}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center backdrop-blur-md border border-white/40 shadow-sm transition-all cursor-pointer"
                title={isFav ? 'Remove from saved' : 'Save property'}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-colors ${
                    isFav ? 'fill-red-500 text-red-500' : 'text-ink-600 hover:text-red-500'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Bottom tag: Floor & Facing */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span className="text-[11px] font-medium text-white/95 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/20">
              {listing.floor ? `Floor ${listing.floor}/${listing.total_floors || 10}` : 'Ready to Move'} · {listing.facing_direction || 'East Facing'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Title & Locality */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/listings/${listing.listing_id}`}>
                  <h3 className="font-serif font-bold text-lg text-ink-950 truncate hover:text-brand-700 transition-colors">
                    {listing.apartment_name || 'Architectural Residence'}
                  </h3>
                </Link>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-500">
                  <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span className="truncate font-medium">{capitalize(listing.locality)}</span>
                </div>
              </div>
            </div>

            {/* Price & Rate */}
            <div className="mt-3.5 flex items-baseline justify-between border-t border-border-subtle/70 pt-3">
              <div>
                <span className="text-xl font-bold font-mono text-ink-950">
                  {formatPrice(listing.price)}
                </span>
                {pricePerSqft > 0 && (
                  <span className="text-xs font-mono text-ink-500 ml-2">
                    ₹{pricePerSqft.toLocaleString('en-IN')}/sq.ft
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Fair Value
              </span>
            </div>

            {/* Key Architectural Specs */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-border-subtle/70 text-xs text-ink-700">
              <div className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-ink-400" />
                <span className="font-semibold">{getBHKLabel(listing.bedroom)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-3.5 h-3.5 text-ink-400" />
                <span>{listing.bathroom || 2} Baths</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-ink-400" />
                <span className="font-mono">{formatArea(listing.carpet_area)}</span>
              </div>
            </div>
          </div>

          {/* Footer Action: Ivy Audit Trigger */}
          <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between gap-2">
            <button
              onClick={() => setShowInspection(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brass-500" />
              <span>View 120-Pt Inspection</span>
            </button>
            <Link
              href={`/listings/${listing.listing_id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-brand-700 transition-colors"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Card>

      {/* 120-Point Inspection Dossier Modal */}
      <InspectionModal
        listing={listing}
        isOpen={showInspection}
        onClose={() => setShowInspection(false)}
      />
    </>
  )
}
