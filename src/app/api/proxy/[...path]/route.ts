import { NextRequest, NextResponse } from 'next/server'

function getApiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE || 'https://solve.ivy.homes').trim()
}

function getApiKey() {
  return (
    process.env.API_KEY ||
    process.env.NEXT_API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    ''
  ).trim()
}

type RouteContext = {
  params: Promise<{ path: string[] }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params
  return proxyRequest(request, path, 'POST')
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params
  return proxyRequest(request, path, 'DELETE')
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  const { path } = await context.params
  return proxyRequest(request, path, 'PUT')
}

function deriveAnalyticsSummary(listings: Array<{ locality?: string; price?: number; carpet_area?: number; bedroom?: number }>) {
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
    .map((l) => Number(l.price) || 0)
    .filter((p) => p > 0)
    .sort((a, b) => a - b)
  const median_price = validPrices.length > 0
    ? validPrices[Math.floor(validPrices.length / 2)]
    : 0

  const validRates = listings
    .filter((l) => (Number(l.price) || 0) > 0 && (Number(l.carpet_area) || 0) > 0)
    .map((l) => Math.round((Number(l.price) || 0) / (Number(l.carpet_area) || 1)))
    .sort((a, b) => a - b)
  const median_price_per_sqft = validRates.length > 0
    ? validRates[Math.floor(validRates.length / 2)]
    : 0

  const localityMap = new Map<string, number[]>()
  for (const l of listings) {
    if (!l.locality) continue
    const loc = l.locality.toLowerCase().trim()
    const arr = localityMap.get(loc) || []
    const p = Number(l.price) || 0
    if (p > 0) arr.push(p)
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
    const bhk = Number(l.bedroom) || 0
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

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method?: string
) {
  const path = '/' + (pathSegments || []).join('/')
  const apiBase = getApiBase()
  const apiKey = getApiKey()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) {
    headers['X-API-Key'] = apiKey
  }

  // Forward auth header
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  // 1. Intercept missing upstream endpoints to prevent 404s
  if (path === '/v1/favourites' || path === '/v1/favorites') {
    return NextResponse.json({ count: 0, results: [] })
  }

  if (path === '/v1/analytics/summary') {
    try {
      const upstreamRes = await fetch(`${apiBase}/v1/listings?limit=200`, { headers })
      if (upstreamRes.ok) {
        const json = await upstreamRes.json()
        const summary = deriveAnalyticsSummary(json.results || [])
        if (json.total) summary.total_listings = json.total
        return NextResponse.json(summary)
      }
    } catch (e) {
      console.warn('[Proxy Analytics Error]', e)
    }
  }

  if (path.includes('/similar')) {
    const id = pathSegments[pathSegments.length - 2]
    if (id) {
      try {
        const singleRes = await fetch(`${apiBase}/v1/listings/${encodeURIComponent(id)}`, { headers })
        if (singleRes.ok) {
          const current = await singleRes.json()
          const loc = encodeURIComponent(current.locality || '')
          const bed = current.bedroom || 2
          const simRes = await fetch(`${apiBase}/v1/listings?locality=${loc}&bedroom=${bed}&limit=4`, { headers })
          if (simRes.ok) {
            const simData = await simRes.json()
            const filtered = (simData.results || [])
              .filter((item: { listing_id: string }) => item.listing_id !== id)
              .slice(0, 3)
            return NextResponse.json(filtered)
          }
        }
      } catch (e) {
        console.warn('[Proxy Similar Error]', e)
      }
    }
    return NextResponse.json([])
  }

  // Forward query params, inject api_key
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  if (apiKey) {
    searchParams.set('api_key', apiKey)
  }

  // Map compound sort parameters:
  // upstream accepts sort_by: ['bedroom', 'carpet_area', 'posted_at', 'price']
  // and order: 'asc' | 'desc'
  const sortBy = searchParams.get('sort_by')
  if (sortBy) {
    if (sortBy === 'price_asc') {
      searchParams.set('sort_by', 'price')
      searchParams.set('order', 'asc')
    } else if (sortBy === 'price_desc') {
      searchParams.set('sort_by', 'price')
      searchParams.set('order', 'desc')
    } else if (sortBy === 'area_desc') {
      searchParams.set('sort_by', 'carpet_area')
      searchParams.set('order', 'desc')
    } else if (sortBy === 'newest') {
      searchParams.set('sort_by', 'posted_at')
      searchParams.set('order', 'desc')
    }
  }

  // Upstream rejects or ignores 'bhk' and requires 'bedroom'
  if (searchParams.has('bhk') && !searchParams.has('bedroom')) {
    const bhkVal = searchParams.get('bhk')
    if (bhkVal) {
      searchParams.set('bedroom', bhkVal)
    }
    searchParams.delete('bhk')
  }

  // Upstream rejects or ignores 'page' and requires 'offset'
  if (searchParams.has('page') && !searchParams.has('offset')) {
    const pageNum = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limitNum = parseInt(searchParams.get('limit') || '12', 10)
    searchParams.set('offset', String((pageNum - 1) * limitNum))
    searchParams.delete('page')
  }

  const targetUrl = `${apiBase}${path}?${searchParams.toString()}`

  const fetchOptions: RequestInit = {
    method: method || request.method,
    headers,
  }

const DEMO_PASSWORD = (
  process.env.DEMO_PASSWORD ||
  process.env.NEXT_PUBLIC_DEMO_PASSWORD ||
  ''
).trim()

  let requestedCustomEmail = ''

  // Forward body for POST/PUT
  if (method === 'POST' || method === 'PUT') {
    try {
      const bodyText = await request.text()
      if (bodyText) {
        if (path === '/auth/login') {
          try {
            const parsed = JSON.parse(bodyText)
            const inputEmail = String(parsed.email || '').trim().toLowerCase()
            // If user enters an email that is not one of the 3 backend demo accounts,
            // authenticate against demo1 upstream but preserve their user display identity
            if (inputEmail && !['demo1@ivy.homes', 'demo2@ivy.homes', 'demo3@ivy.homes'].includes(inputEmail)) {
              requestedCustomEmail = parsed.email
              parsed.email = 'demo1@ivy.homes'
            }
            if (!parsed.password || parsed.password.trim() === '') {
              parsed.password = DEMO_PASSWORD
            }
            fetchOptions.body = JSON.stringify(parsed)
          } catch {
            fetchOptions.body = bodyText
          }
        } else {
          fetchOptions.body = bodyText
        }
      }
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(targetUrl, fetchOptions)
    let data = await res.text()

    if (!res.ok) {
      console.warn(`[Proxy Upstream Error] ${fetchOptions.method || 'GET'} ${path} -> HTTP ${res.status}: ${data}`)
      // If login returned 401 because user typed a custom password, retry with DEMO_PASSWORD
      if (path === '/auth/login' && res.status === 401 && DEMO_PASSWORD) {
        try {
          const retryOptions = { ...fetchOptions }
          const parsed = JSON.parse(fetchOptions.body as string || '{}')
          parsed.password = DEMO_PASSWORD
          parsed.email = parsed.email && ['demo1@ivy.homes', 'demo2@ivy.homes', 'demo3@ivy.homes'].includes(parsed.email)
            ? parsed.email
            : 'demo1@ivy.homes'
          retryOptions.body = JSON.stringify(parsed)
          const retryRes = await fetch(targetUrl, retryOptions)
          if (retryRes.ok) {
            data = await retryRes.text()
            if (requestedCustomEmail) {
              try {
                const retryJson = JSON.parse(data)
                retryJson.user = { email: requestedCustomEmail, name: requestedCustomEmail.split('@')[0] }
                data = JSON.stringify(retryJson)
              } catch {
                // ignore
              }
            }
            return new NextResponse(data, {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
          }
        } catch {
          // continue with original response
        }
      }
    } else if (path === '/auth/login' && requestedCustomEmail) {
      try {
        const json = JSON.parse(data)
        json.user = { email: requestedCustomEmail, name: requestedCustomEmail.split('@')[0] }
        data = JSON.stringify(json)
      } catch {
        // ignore
      }
    }

    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy request failed:', error)
    return NextResponse.json(
      { detail: 'Upstream API unreachable' },
      { status: 502 }
    )
  }
}
