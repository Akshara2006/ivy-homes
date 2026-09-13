import Cookies from 'js-cookie'
import type {
  Listing,
  Rental,
  Project,
  PaginatedResponse,
  FavouritesResponse,
  AnalyticsSummary,
  LoginResponse,
  ListingFilters,
  RentalFilters,
  ProjectFilters,
} from './types'

// Proxy through Next.js API routes to keep the API key server-side
const PROXY = '/api/proxy'

function getToken(): string | undefined {
  const token = Cookies.get('ivy_token')
  if (!token || token === 'undefined' || token === 'null') return undefined
  return token
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  // Clean undefined params
  const cleanParams: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) {
      cleanParams[k] = String(v)
    }
  }

  const qs = new URLSearchParams(cleanParams).toString()
  const url = `${PROXY}${path}${qs ? '?' + qs : ''}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, body.detail || 'Request failed')
  }

  return res.json()
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Auth ───

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${PROXY}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Login failed' }))
    throw new ApiError(res.status, body.detail)
  }

  const data: LoginResponse = await res.json()

  // Store token — expires_in from API, convert to days for cookie
  const expiryDays = (data.expires_in || 86400) / 86400
  const token = data.access_token || data.token
  if (token) {
    Cookies.set('ivy_token', token, { expires: expiryDays })
  }
  if (data.user) {
    Cookies.set('ivy_user', JSON.stringify(data.user), { expires: expiryDays })
  }

  return data
}

export async function logout(): Promise<void> {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {
    // fine — token might already be expired
  }
  Cookies.remove('ivy_token')
  Cookies.remove('ivy_user')
}

export function getStoredUser() {
  const raw = Cookies.get('ivy_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// ─── Listings ───

export async function getListings(
  filters: ListingFilters = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Listing>> {
  const queryParams: Record<string, string | number | undefined> = { ...filters, page, limit }

  if (filters.sort_by) {
    if (filters.sort_by === 'price_asc') {
      queryParams.sort_by = 'price'
      queryParams.order = 'asc'
    } else if (filters.sort_by === 'price_desc') {
      queryParams.sort_by = 'price'
      queryParams.order = 'desc'
    } else if (filters.sort_by === 'area_desc') {
      queryParams.sort_by = 'carpet_area'
      queryParams.order = 'desc'
    } else if (filters.sort_by === 'newest') {
      queryParams.sort_by = 'posted_at'
      queryParams.order = 'desc'
    }
  }

  if (queryParams.bhk !== undefined && queryParams.bedroom === undefined) {
    queryParams.bedroom = queryParams.bhk
    delete queryParams.bhk
  }

  return request('/v1/listings', {}, queryParams)
}

export async function getListing(id: string): Promise<Listing> {
  try {
    return await request(`/v1/listings/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await request(`/v1/listing/${encodeURIComponent(id)}`)
    }
    throw err
  }
}

export async function getSimilarListings(id: string): Promise<Listing[]> {
  try {
    const current = await getListing(id)
    if (!current) return []
    const res = await getListings(
      {
        locality: current.locality,
        bedroom: current.bedroom,
      },
      1,
      4
    )
    return (res.results || []).filter((l) => l.listing_id !== id).slice(0, 3)
  } catch {
    return []
  }
}

// ─── Rentals ───

export async function getRentals(
  filters: RentalFilters = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Rental>> {
  const queryParams: Record<string, string | number | undefined> = { ...filters, page, limit }

  if (filters.sort_by) {
    if (filters.sort_by === 'price_asc') {
      queryParams.sort_by = 'price'
      queryParams.order = 'asc'
    } else if (filters.sort_by === 'price_desc') {
      queryParams.sort_by = 'price'
      queryParams.order = 'desc'
    } else if (filters.sort_by === 'area_desc') {
      queryParams.sort_by = 'carpet_area'
      queryParams.order = 'desc'
    } else if (filters.sort_by === 'newest') {
      queryParams.sort_by = 'posted_at'
      queryParams.order = 'desc'
    }
  }

  if (filters.bhk !== undefined && queryParams.bedroom === undefined) {
    queryParams.bedroom = filters.bhk
    delete queryParams.bhk
  }

  return request('/v1/rentals', {}, queryParams)
}

export async function getRental(id: string): Promise<Rental> {
  try {
    return await request(`/v1/rentals/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return await request(`/v1/rental/${encodeURIComponent(id)}`)
    }
    throw err
  }
}

// ─── Projects ───

export async function getProjects(
  filters: ProjectFilters = {},
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Project>> {
  return request('/v1/projects', {}, { ...filters, page, limit })
}

export async function getProject(id: string): Promise<Project> {
  return request(`/v1/projects/${encodeURIComponent(id)}`)
}

// ─── Favourites ───

export async function getFavourites(): Promise<FavouritesResponse> {
  if (typeof window === 'undefined') return { count: 0, results: [] }
  try {
    const raw = localStorage.getItem('ivy_favourites')
    const ids: string[] = raw ? JSON.parse(raw) : []
    if (ids.length === 0) return { count: 0, results: [] }

    const results = (
      await Promise.all(
        ids.map((id) => getListing(id).catch(() => null))
      )
    ).filter((l): l is Listing => l !== null)

    return { count: results.length, results }
  } catch {
    return { count: 0, results: [] }
  }
}

export async function addFavourite(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('ivy_favourites')
    const ids: string[] = raw ? JSON.parse(raw) : []
    if (!ids.includes(id)) {
      ids.push(id)
      localStorage.setItem('ivy_favourites', JSON.stringify(ids))
    }
  } catch {
    // ignore
  }
}

export async function removeFavourite(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('ivy_favourites')
    let ids: string[] = raw ? JSON.parse(raw) : []
    ids = ids.filter((item) => item !== id)
    localStorage.setItem('ivy_favourites', JSON.stringify(ids))
  } catch {
    // ignore
  }
}

// ─── Analytics ───

export function deriveAnalyticsSummary(listings: Listing[]): AnalyticsSummary {
  if (!listings || listings.length === 0) {
    return {
      city: 'Pune',
      total_listings: 0,
      median_price: 0,
      median_price_per_sqft: 0,
      by_locality: [],
      by_bhk: [],
    }
  }

  const validPrices = listings
    .map((l) => l.price)
    .filter((p) => p > 0)
    .sort((a, b) => a - b)
  const median_price = validPrices.length > 0
    ? validPrices[Math.floor(validPrices.length / 2)]
    : 0

  const validRates = listings
    .filter((l) => l.price > 0 && l.carpet_area > 0)
    .map((l) => Math.round(l.price / l.carpet_area))
    .sort((a, b) => a - b)
  const median_price_per_sqft = validRates.length > 0
    ? validRates[Math.floor(validRates.length / 2)]
    : 0

  const localityMap = new Map<string, number[]>()
  for (const l of listings) {
    if (!l.locality) continue
    const loc = l.locality.toLowerCase().trim()
    const arr = localityMap.get(loc) || []
    if (l.price > 0) arr.push(l.price)
    localityMap.set(loc, arr)
  }

  const by_locality = Array.from(localityMap.entries())
    .map(([locality, prices]) => {
      prices.sort((a, b) => a - b)
      const med = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0
      return { locality, count: prices.length, median_price: med }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const bhkMap = new Map<number, number>()
  for (const l of listings) {
    const bhk = l.bedroom
    if (bhk > 0) {
      bhkMap.set(bhk, (bhkMap.get(bhk) || 0) + 1)
    }
  }

  const by_bhk = Array.from(bhkMap.entries())
    .map(([bedroom, count]) => ({ bedroom, count }))
    .sort((a, b) => a.bedroom - b.bedroom)

  return {
    city: 'Pune',
    total_listings: listings.length,
    median_price,
    median_price_per_sqft,
    by_locality,
    by_bhk,
  }
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    return await request('/v1/analytics/summary')
  } catch {
    const listings = await fetchAllPages((page, limit) => getListings({}, page, limit), 200)
    return deriveAnalyticsSummary(listings)
  }
}

// ─── Fetch all records (for investigation / insights) ───

export async function fetchAllPages<T>(
  fetcher: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  limit = 200
): Promise<T[]> {
  const all: T[] = []
  let page = 1
  let total = Infinity

  while (all.length < total) {
    try {
      const res = await fetcher(page, limit)
      const results = res.results || []
      total = res.total ?? results.length
      const pageSize = res.page_size || limit

      all.push(...results)
      if (results.length === 0 || results.length < pageSize || all.length >= total) {
        break
      }
      page++
    } catch {
      break
    }
  }

  return all
}
