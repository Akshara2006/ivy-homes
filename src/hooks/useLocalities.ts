'use client'

import { useQuery } from '@tanstack/react-query'
import { getListings } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export function useLocalities() {
  const { isLoggedIn } = useAuth()
  return useQuery({
    queryKey: ['localities'],
    enabled: isLoggedIn,
    queryFn: async () => {
      // Fetch first page to get total, then extract unique localities
      const first = await getListings({}, 1, 200)
      const localities = new Set<string>()
      first.results.forEach((l) => {
        if (l.locality) localities.add(l.locality)
      })
      // If there are more pages, sample up to 5 pages
      const totalPages = Math.ceil((first.total || 0) / 200)
      for (let p = 2; p <= Math.min(totalPages, 5); p++) {
        try {
          const page = await getListings({}, p, 200)
          page.results.forEach((l) => {
            if (l.locality) localities.add(l.locality)
          })
        } catch {
          // ignore page fetch errors
        }
      }
      return Array.from(localities).sort()
    },
    staleTime: 300_000, // 5 min
  })
}
