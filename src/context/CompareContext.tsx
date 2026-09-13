'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Listing } from '@/lib/types'

const MAX_COMPARE = 3

interface CompareState {
  items: Listing[]
  addItem: (listing: Listing) => void
  removeItem: (id: string) => void
  isInCompare: (id: string) => boolean
  clearAll: () => void
  isFull: boolean
}

const CompareContext = createContext<CompareState>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInCompare: () => false,
  clearAll: () => {},
  isFull: false,
})

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Listing[]>([])

  const addItem = useCallback((listing: Listing) => {
    setItems((prev) => {
      if (prev.length >= MAX_COMPARE) return prev
      if (prev.some((l) => l.listing_id === listing.listing_id)) return prev
      return [...prev, listing]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((l) => l.listing_id !== id))
  }, [])

  const isInCompare = useCallback(
    (id: string) => items.some((l) => l.listing_id === id),
    [items]
  )

  const clearAll = useCallback(() => setItems([]), [])

  return (
    <CompareContext.Provider
      value={{ items, addItem, removeItem, isInCompare, clearAll, isFull: items.length >= MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}
