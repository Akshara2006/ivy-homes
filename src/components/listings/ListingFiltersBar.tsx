'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SlidersHorizontal, X, LayoutGrid, Table, Search } from 'lucide-react'
import { useLocalities } from '@/hooks/useLocalities'
import { capitalize } from '@/lib/utils'
import type { ListingFilters } from '@/lib/types'

const SORT_OPTIONS = [
  { value: '', label: 'Curated Recommendations' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area_desc', label: 'Carpet Area: Largest' },
  { value: 'newest', label: 'Recently Verified' },
]

const BHK_TABS = [
  { label: 'All BHKs', value: undefined },
  { label: '1 BHK', value: 1 },
  { label: '2 BHK', value: 2 },
  { label: '3 BHK', value: 3 },
  { label: '4+ BHK', value: 4 },
]

interface Props {
  filters: ListingFilters
  onChange: (filters: ListingFilters) => void
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
}

export function ListingFiltersBar({ filters, onChange, viewMode, onViewModeChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { data: localities = [] } = useLocalities()

  const localityOptions = [
    { value: '', label: 'All Localities' },
    ...localities.map((loc) => ({
      value: loc.toLowerCase(),
      label: capitalize(loc),
    })),
  ]

  const activeFilterCount = [
    filters.locality,
    filters.bhk,
    filters.min_price,
    filters.max_price,
    filters.property_type,
    filters.furnishing,
    filters.sort_by,
  ].filter(Boolean).length

  const handleClear = () => {
    onChange({})
  }

  const handleBhkSelect = (bhkVal: number | undefined) => {
    onChange({ ...filters, bhk: bhkVal })
  }

  const handleBudgetFilter = (min?: number, max?: number) => {
    if (filters.min_price === min && filters.max_price === max) {
      onChange({ ...filters, min_price: undefined, max_price: undefined })
    } else {
      onChange({ ...filters, min_price: min, max_price: max })
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border-subtle p-4 shadow-atelier space-y-3.5 mb-6">
      {/* Top row: BHK Segmented Controls + View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle/80">
        {/* BHK Segmented Control */}
        <div className="flex items-center p-1 rounded-xl bg-surface-subtle border border-border-subtle overflow-x-auto no-scrollbar">
          {BHK_TABS.map((tab) => {
            const isSelected = filters.bhk === tab.value
            return (
              <button
                key={tab.label}
                onClick={() => handleBhkSelect(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'text-ink-600 hover:text-brand-800'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Right tools: Advanced toggle + View Mode Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* Quick budget chips */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => handleBudgetFilter(undefined, 12000000)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filters.max_price === 12000000
                  ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold'
                  : 'border-border-subtle text-ink-600 hover:bg-surface-subtle'
              }`}
            >
              &lt; ₹1.2 Cr
            </button>
            <button
              onClick={() => handleBudgetFilter(12000000, 25000000)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filters.min_price === 12000000 && filters.max_price === 25000000
                  ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold'
                  : 'border-border-subtle text-ink-600 hover:bg-surface-subtle'
              }`}
            >
              ₹1.2 - 2.5 Cr
            </button>
            <button
              onClick={() => handleBudgetFilter(25000000, undefined)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filters.min_price === 25000000
                  ? 'bg-brand-50 border-brand-300 text-brand-800 font-semibold'
                  : 'border-border-subtle text-ink-600 hover:bg-surface-subtle'
              }`}
            >
              Luxury 2.5+ Cr
            </button>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center p-1 rounded-xl bg-surface-subtle border border-border-subtle">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-brand-700 font-bold' : 'text-ink-400 hover:text-ink-700'
              }`}
              title="Atelier Gallery View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-sm text-brand-700 font-bold' : 'text-ink-400 hover:text-ink-700'
              }`}
              title="Investment Terminal View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-ink-600 border border-border-subtle bg-surface-subtle"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-700 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-ink-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main search and locality selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select
          id="filter-locality"
          value={filters.locality || ''}
          onChange={(e) => onChange({ ...filters, locality: e.target.value || undefined })}
          options={localityOptions}
        />

        <Select
          id="filter-sort"
          value={filters.sort_by || ''}
          onChange={(e) => onChange({ ...filters, sort_by: e.target.value || undefined })}
          options={SORT_OPTIONS}
        />

        <div className="relative">
          <input
            type="text"
            placeholder="Search apartment name or project..."
            className="w-full bg-white text-ink-900 placeholder:text-ink-400 border border-border-medium rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 shadow-sm pl-9"
          />
          <Search className="w-4 h-4 text-ink-400 absolute left-3 top-3.5" />
        </div>
      </div>

      {/* Expandable Advanced Filter Studio */}
      {showAdvanced && (
        <div className="pt-3.5 border-t border-border-subtle/80 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up">
          <Select
            id="filter-furnishing"
            label="Furnishing Status"
            value={filters.furnishing || ''}
            onChange={(e) => onChange({ ...filters, furnishing: e.target.value || undefined })}
            placeholder="Any Furnishing"
            options={[
              { value: 'unfurnished', label: 'Unfurnished' },
              { value: 'semi-furnished', label: 'Semi-Furnished' },
              { value: 'fully-furnished', label: 'Fully Furnished' },
            ]}
          />

          <Input
            id="filter-min-price"
            label="Min Price (₹)"
            type="number"
            placeholder="e.g. 5000000"
            value={filters.min_price || ''}
            onChange={(e) => onChange({ ...filters, min_price: e.target.value ? Number(e.target.value) : undefined })}
          />

          <Input
            id="filter-max-price"
            label="Max Price (₹)"
            type="number"
            placeholder="e.g. 20000000"
            value={filters.max_price || ''}
            onChange={(e) => onChange({ ...filters, max_price: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      )}
    </div>
  )
}
