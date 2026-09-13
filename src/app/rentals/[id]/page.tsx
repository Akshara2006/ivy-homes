'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getRental } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Shell } from '@/components/layout/Shell'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { formatRent, formatArea, capitalize, getBHKLabel, timeAgo } from '@/lib/utils'
import {
  ArrowLeft, MapPin, Bed, Bath, Maximize2, Layers, Compass,
  User, Phone, Calendar,
} from 'lucide-react'

export default function RentalDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading } = useAuth()

  const { data: rental, isLoading } = useQuery({
    queryKey: ['rental', id],
    queryFn: () => getRental(id),
    enabled: isLoggedIn && !!id,
  })

  if (authLoading) return <PageLoader />
  if (!isLoggedIn) return <LoginForm />
  if (isLoading) return <Shell><PageLoader /></Shell>
  if (!rental) return <Shell><div className="text-center py-20">Rental not found</div></Shell>

  const carpetArea = rental.carpet_area
  const superArea = rental.super_built_up_area || rental.super_builtup_area || 0

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card>
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-300" />
          <CardContent className="space-y-4">
            <h1 className="text-2xl font-bold text-ink-900">{rental.title || rental.apartment_name}</h1>
            <div className="flex items-center gap-2 text-ink-500">
              <MapPin className="w-4 h-4" />
              <span>{capitalize(rental.locality)}</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-ink-900">{formatRent(rental.price)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-surface-50 rounded-lg">
                <span className="text-ink-400">Deposit</span>
                <p className="font-semibold">₹{rental.deposit?.toLocaleString('en-IN') || 'N/A'}</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg">
                <span className="text-ink-400">Maintenance</span>
                <p className="font-semibold">₹{rental.maintenance?.toLocaleString('en-IN') || 'N/A'}/mo</p>
              </div>
              <div className="p-3 bg-surface-50 rounded-lg">
                <span className="text-ink-400">Total/mo</span>
                <p className="font-semibold">₹{((rental.price || 0) + (rental.maintenance || 0)).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="green">{getBHKLabel(rental.bedroom)}</Badge>
              <Badge>{capitalize(rental.property_type)}</Badge>
              <Badge variant="blue">{capitalize(rental.furnishing)}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-100">
              <StatItem icon={Bed} label="Bedrooms" value={String(rental.bedroom)} />
              <StatItem icon={Bath} label="Bathrooms" value={String(rental.bathroom)} />
              <StatItem icon={Maximize2} label="Carpet Area" value={carpetArea > 0 ? formatArea(carpetArea) : 'N/A'} />
              <StatItem icon={Layers} label="Floor" value={`${rental.floor} of ${rental.total_floors}`} />
              <StatItem icon={Compass} label="Facing" value={rental.facing_direction ? capitalize(rental.facing_direction) : 'N/A'} />
              {superArea > 0 && (
                <StatItem icon={Maximize2} label="Super Built-up" value={formatArea(superArea)} />
              )}
            </div>

            {rental.description && (
              <div className="pt-4 border-t border-surface-100">
                <h3 className="text-sm font-medium text-ink-700 mb-2">Description</h3>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">
                  {rental.description}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-surface-100 text-sm text-ink-600">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-ink-400" />{rental.posted_by_name}</div>
              {rental.posted_by_contact && (
                <div className="flex items-center gap-2 mt-1"><Phone className="w-4 h-4 text-ink-400" />{rental.posted_by_contact}</div>
              )}
            </div>

            <div className="pt-4 border-t border-surface-100 text-xs text-ink-400 flex gap-4">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Posted {timeAgo(rental.posted_at)}</span>
              <span>ID: {rental.listing_id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

function StatItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-ink-400" />
      </div>
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className="text-sm font-medium text-ink-700">{value}</p>
      </div>
    </div>
  )
}
