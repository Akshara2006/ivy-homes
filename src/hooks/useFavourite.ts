'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFavourites, addFavourite, removeFavourite } from '@/lib/api'
import { toast } from 'sonner'

export function useFavourites() {
  return useQuery({
    queryKey: ['favourites'],
    queryFn: getFavourites,
    staleTime: 30_000,
  })
}

export function useFavourite(listingId: string) {
  const qc = useQueryClient()
  const { data } = useFavourites()

  const isFav = data?.results?.some((l) => l.listing_id === listingId) ?? false

  const add = useMutation({
    mutationFn: () => addFavourite(listingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favourites'] })
      toast.success('Saved to favourites')
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : 'Failed to save'
      toast.error(message)
    },
  })

  const remove = useMutation({
    mutationFn: () => removeFavourite(listingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['favourites'] })
      toast.success('Removed from favourites')
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : 'Failed to remove'
      toast.error(message)
    },
  })

  const toggle = () => {
    if (isFav) remove.mutate()
    else add.mutate()
  }

  return { isFav, toggle, isPending: add.isPending || remove.isPending }
}
