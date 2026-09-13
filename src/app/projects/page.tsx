'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { getProjects } from '@/lib/api'
import { Shell } from '@/components/layout/Shell'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/listings/Pagination'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { useLocalities } from '@/hooks/useLocalities'
import { formatPrice, capitalize } from '@/lib/utils'
import { MapPin, Building2, ShieldCheck, ArrowUpRight, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { ProjectFilters } from '@/lib/types'

const PAGE_SIZE = 12

export default function ProjectsPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ProjectFilters>({})
  const { data: localities = [] } = useLocalities()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projects', filters, page],
    queryFn: () => getProjects(filters, page, PAGE_SIZE),
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
  })

  if (authLoading) return <PageLoader />
  if (!isLoggedIn) return <LoginForm />

  // Data strictly from API
  const projects = data?.results || []
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
              <span>RERA Registered · Pre-Audited Masterplans</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink-950 tracking-tight leading-[1.15]">
              Iconic Masterplans & Launches.
            </h1>
            <p className="text-sm sm:text-base text-ink-600 mt-3 leading-relaxed">
              Explore builder masterplans and new developments. Pre-vetted RERA registrations, verified title documents, and transparent possession tracking.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div className="p-3.5 rounded-2xl bg-white border border-border-subtle shadow-atelier">
              <span className="text-[10px] text-ink-500 uppercase font-bold tracking-wider block">Audited Projects</span>
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

        <div className="w-48">
          <Select
            id="filter-status"
            value={filters.project_status || ''}
            onChange={(e) => setFilters({ ...filters, project_status: e.target.value || undefined })}
            placeholder="Any Project Status"
            options={[
              { value: 'ready_to_move', label: 'Ready to Move' },
              { value: 'under_construction', label: 'Under Construction' },
              { value: 'new_launch', label: 'New Launch' },
            ]}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="text-xs text-ink-500 hover:text-red-600">
            <X className="w-3.5 h-3.5 mr-1" /> Reset
          </Button>
        )}
      </div>

      {/* Projects Content */}
      {isLoading ? (
        <PageLoader message="Fetching projects from API..." />
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Unable to Load Projects"
          description={error instanceof Error ? error.message : 'An error occurred while communicating with the projects API.'}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Masterplans Found"
          description="Adjust your filters to discover verified builder launches."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, idx) => (
            <Card key={project.project_id} hover className="overflow-hidden bg-white border border-border-subtle rounded-2xl shadow-atelier flex flex-col justify-between">
              {/* Cover Preview */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                <Image
                  src={idx % 2 === 0 ? '/images/residence-1.jpg' : '/images/terrace-1.jpg'}
                  alt={project.apartment_name || 'Project Masterplan'}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-950/90 text-white backdrop-blur-md border border-brand-700/50">
                    <ShieldCheck className="w-3 h-3 text-brass-400" />
                    RERA Approved
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="text-[11px] font-medium text-white/95 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md">
                    {capitalize(project.project_status?.replace(/_/g, ' ') || 'Ready')}
                    {project.total_towers ? ` · ${project.total_towers} Towers` : ''}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block mb-1">
                    {project.developer_name || 'Verified Developer'}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-ink-950 truncate hover:text-brand-700 transition-colors">
                    {project.apartment_name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-ink-500">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="font-medium">{capitalize(project.locality)}</span>
                  </div>

                  {/* Price Range */}
                  <div className="mt-3.5 pt-3 border-t border-border-subtle/70 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-bold font-mono text-ink-950">
                        {project.price_min && project.price_max
                          ? `${formatPrice(project.price_min)} - ${formatPrice(project.price_max)}`
                          : project.price_min
                          ? `From ${formatPrice(project.price_min)}`
                          : 'Price on Request'}
                      </span>
                      {(project.min_area_sqft || project.max_area_sqft) && (
                        <div className="text-xs font-mono text-ink-500 mt-0.5">
                          {project.min_area_sqft || '—'} - {project.max_area_sqft || '—'} sq.ft
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Amenities */}
                  {project.amenities && project.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.amenities.slice(0, 3).map((a) => (
                        <span key={a} className="text-[10px] font-medium text-ink-600 bg-surface-subtle px-2 py-0.5 rounded-md border border-border-subtle">
                          {a}
                        </span>
                      ))}
                      {project.amenities.length > 3 && (
                        <span className="text-[10px] font-medium text-ink-400 self-center">
                          +{project.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-ink-400 truncate max-w-[160px]">
                    {project.rera_number || 'RERA Verified'}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs font-semibold text-brand-800 hover:text-brand-900"
                    onClick={() => alert(`RERA Number: ${project.rera_number || 'Verified'}\nPossession: ${project.possession_date || 'In Progress'}`)}
                  >
                    Details
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
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
