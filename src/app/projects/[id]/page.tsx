'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getProject, getListings } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { LoginForm } from '@/components/auth/LoginForm'
import { Shell } from '@/components/layout/Shell'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Spinner'
import { ListingCard } from '@/components/listings/ListingCard'
import { formatPrice, formatArea, capitalize } from '@/lib/utils'
import { ArrowLeft, MapPin } from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading } = useAuth()

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: isLoggedIn && !!id,
  })

  // Fetch listings for this project
  const { data: projectListings } = useQuery({
    queryKey: ['project-listings', id],
    queryFn: () => getListings({ project_id: id }, 1, 50),
    enabled: isLoggedIn && !!id,
  })

  if (authLoading) return <PageLoader />
  if (!isLoggedIn) return <LoginForm />
  if (isLoading) return <Shell><PageLoader /></Shell>
  if (!project) return <Shell><div className="text-center py-20">Project not found</div></Shell>

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <Card>
          <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-300" />
          <CardContent className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-ink-900">{project.apartment_name}</h1>
              <p className="text-ink-500">{project.developer_name}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-ink-500">
                <MapPin className="w-4 h-4" />
                {capitalize(project.locality)}
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink-900">
                {formatPrice(project.price_min)} – {formatPrice(project.price_max)}
              </span>
            </div>

            <Badge variant="amber">{capitalize(project.project_status)}</Badge>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoBox label="Total Units" value={String(project.total_units)} />
              <InfoBox label="Towers" value={String(project.total_towers)} />
              <InfoBox label="Floors" value={String(project.total_floors)} />
              <InfoBox label="Listings" value={String(project.total_listings)} />
              <InfoBox label="Min Area" value={formatArea(project.min_area_sqft)} />
              <InfoBox label="Max Area" value={formatArea(project.max_area_sqft)} />
              <InfoBox label="Launch" value={project.launch_date || 'N/A'} />
              <InfoBox label="Possession" value={project.possession_date || 'TBD'} />
            </div>

            {project.rera_number && (
              <p className="text-sm text-ink-500">RERA: {project.rera_number}</p>
            )}

            {project.amenities?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-ink-700 mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map(a => <Badge key={a}>{a}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project listings */}
        {projectListings && projectListings.results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">
              Listings in this project ({projectListings.total})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectListings.results.map(l => (
                <ListingCard key={l.listing_id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-surface-50 rounded-lg">
      <p className="text-xs text-ink-400">{label}</p>
      <p className="text-sm font-semibold text-ink-700">{value}</p>
    </div>
  )
}
