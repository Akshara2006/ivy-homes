'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice, formatArea, capitalize, getBHKLabel } from '@/lib/utils'
import { ShieldCheck, GitCompareArrows, Heart, ArrowUpRight } from 'lucide-react'
import type { Listing } from '@/lib/types'
import { useFavourite } from '@/hooks/useFavourite'
import { useCompare } from '@/context/CompareContext'
import { InspectionModal } from './InspectionModal'

interface Props {
  listing: Listing
}

export function ListingTerminalRow({ listing }: Props) {
  const { isFav, toggle, isPending } = useFavourite(listing.listing_id)
  const { addItem, removeItem, isInCompare, isFull } = useCompare()
  const [showInspection, setShowInspection] = useState(false)
  const inCompare = isInCompare(listing.listing_id)

  const pricePerSqft = listing.carpet_area > 0 ? Math.round(listing.price / listing.carpet_area) : 0
  const carpetRatio =
    listing.super_built_up_area && listing.carpet_area
      ? Math.round((listing.carpet_area / listing.super_built_up_area) * 100)
      : 78

  return (
    <>
      <tr className="border-b border-border-subtle/80 hover:bg-surface-subtle/70 transition-colors text-xs text-ink-800">
        {/* Compare Checkbox */}
        <td className="py-3.5 px-3">
          <button
            onClick={() => (inCompare ? removeItem(listing.listing_id) : addItem(listing))}
            disabled={isFull && !inCompare}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
              inCompare
                ? 'bg-brand-700 text-white'
                : 'bg-white border border-border-medium hover:border-brand-600 text-ink-400'
            }`}
            title="Toggle Compare"
          >
            <GitCompareArrows className="w-3.5 h-3.5" />
          </button>
        </td>

        {/* Property & Locality */}
        <td className="py-3.5 px-3">
          <Link href={`/listings/${listing.listing_id}`} className="font-semibold text-ink-950 hover:text-brand-700">
            {listing.apartment_name || 'Property'}
          </Link>
          <div className="text-[11px] text-ink-500 font-medium">{capitalize(listing.locality)}</div>
        </td>

        {/* Configuration */}
        <td className="py-3.5 px-3 font-semibold text-ink-900">
          {getBHKLabel(listing.bedroom)}
        </td>

        {/* Carpet Area & Efficiency */}
        <td className="py-3.5 px-3 font-mono">
          <div>{formatArea(listing.carpet_area)}</div>
          <span className="text-[10px] text-brand-700 font-semibold">{carpetRatio}% carpet</span>
        </td>

        {/* Price & ₹/sq.ft */}
        <td className="py-3.5 px-3">
          <div className="font-bold font-mono text-ink-950">{formatPrice(listing.price)}</div>
          <div className="font-mono text-[11px] text-ink-500">₹{pricePerSqft.toLocaleString('en-IN')}/sqft</div>
        </td>

        {/* Floor & Facing */}
        <td className="py-3.5 px-3 text-ink-600">
          {listing.floor ? `Fl ${listing.floor}/${listing.total_floors || 10}` : '—'}
          <div className="text-[11px] text-ink-400">{listing.facing_direction || 'East'}</div>
        </td>

        {/* Ivy Inspection Audit Status */}
        <td className="py-3.5 px-3">
          <button
            onClick={() => setShowInspection(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            120-Pt Verified
          </button>
        </td>

        {/* Actions */}
        <td className="py-3.5 px-3 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={toggle}
              disabled={isPending}
              className="p-1.5 rounded-lg hover:bg-white text-ink-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <Link
              href={`/listings/${listing.listing_id}`}
              className="p-1.5 rounded-lg hover:bg-white text-ink-500 hover:text-brand-700 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </td>
      </tr>

      <InspectionModal
        listing={listing}
        isOpen={showInspection}
        onClose={() => setShowInspection(false)}
      />
    </>
  )
}
