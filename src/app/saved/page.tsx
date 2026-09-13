'use client'

import { useAuth } from '@/context/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Shell } from '@/components/layout/Shell'
import { ListingCard } from '@/components/listings/ListingCard'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { useFavourites } from '@/hooks/useFavourite'
import { Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function SavedPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const { data, isLoading } = useFavourites()

  if (authLoading) return <PageLoader />
  if (!isLoggedIn) return <LoginForm />
  if (isLoading) return <Shell><PageLoader /></Shell>

  const listings = data?.results || []

  return (
    <Shell>
      <div className="space-y-6">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-2 border border-brand-200">
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Personal Property Portfolio</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-ink-950 tracking-tight">
              Saved Residences
            </h1>
            <p className="text-sm text-ink-500 mt-1">
              {listings.length} verified {listings.length === 1 ? 'property' : 'properties'} saved for inspection and comparison.
            </p>
          </div>

          <Link href="/">
            <Button variant="secondary" size="sm" className="text-xs">
              Explore More Homes
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your Portfolio is Empty"
            description="Tap the heart icon on any residence in the Explorer to pin it to your saved collection."
            action={
              <Link href="/">
                <Button variant="primary">Browse Resale Homes</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, i) => (
              <ListingCard key={listing.listing_id} listing={listing} index={i} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  )
}
