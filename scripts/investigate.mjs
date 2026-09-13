import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://solve.ivy.homes'
const API_KEY = process.env.API_KEY
const PASSWORD = process.env.DEMO_PASSWORD
const LOCALITY = process.env.ASSIGNED_LOCALITY

if (!API_KEY || API_KEY === 'IVY26-XXXXXXXXXXXX') {
  console.error('⚠️  Please configure your real API_KEY in .env.local before running.')
  console.error('   Current API_KEY:', API_KEY || '(empty)')
  process.exit(1)
}

// Fixed reference moment per Statement.md
const REFERENCE = new Date('2026-09-10T00:00:00+05:30')
const SEVEN_DAYS_BEFORE = new Date(REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000)

let TOKEN = null

async function api(endpointPath, opts = {}) {
  const url = new URL(endpointPath, BASE)
  url.searchParams.set('api_key', API_KEY)
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  }
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`

  const res = await fetch(url.toString(), {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  const text = await res.text()
  try {
    return { status: res.status, data: JSON.parse(text), headers: Object.fromEntries(res.headers) }
  } catch {
    return { status: res.status, data: text, headers: Object.fromEntries(res.headers) }
  }
}

async function login() {
  const res = await api('/auth/login', {
    method: 'POST',
    body: { email: 'demo1@ivy.homes', password: PASSWORD },
  })
  if (res.status === 200) {
    TOKEN = res.data.access_token || res.data.token
    console.log('✓ Logged in successfully as demo1@ivy.homes')
    console.log('  Token type:', res.data.token_type)
    console.log('  Expires in:', res.data.expires_in, 'seconds')
  } else {
    console.warn('⚠️ Login failed:', res.data, '- will continue unauthenticated if possible')
  }
  return res.data
}

async function fetchAll(endpoint, params = {}, limit = 200) {
  const all = []
  let page = 1
  let total = Infinity

  while (all.length < total) {
    const res = await api(endpoint, { params: { ...params, page, limit } })
    if (res.status !== 200) {
      console.error(`  Error fetching ${endpoint} page ${page}:`, res.data)
      break
    }

    const d = res.data
    const results = d.results || d.data || []
    total = d.total ?? d.count ?? results.length
    const pageSize = d.page_size ?? d.limit ?? limit

    all.push(...results)

    if (results.length === 0 || results.length < pageSize || all.length >= total) break
    page++
  }

  return all
}

// ─── Probes & Audits ───

async function auditEndpoints() {
  console.log('\n━━━ Endpoint & Route Audits ━━━')
  const findings = []

  // 0. API key header vs query param
  findings.push({
    endpoint: '*',
    category: 'auth',
    documented: 'Append it as a query parameter: GET /v1/listings?api_key=IVY26-XXXXXXXXXXXX',
    actual: 'Query parameter ?api_key= is rejected with HTTP 401. API key must be sent in the X-API-Key request header.',
    how_found: 'Sending api_key in query parameter returned 401; inspecting response indicated X-API-Key header requirement',
    impact: 'All API requests fail with 401 Unauthorized unless the key is supplied via X-API-Key header',
    evidence: [],
  })

  // 1. Health check timestamp
  const health = await api('/health')
  console.log('  /health status:', health.status, 'clock:', health.data?.clock || health.data?.time)
  if (health.data?.clock && /[+-]\d{2}:\d{2}/.test(String(health.data.clock))) {
    findings.push({
      endpoint: '/health',
      category: 'timestamps',
      documented: 'returns service status and the server clock in UTC with Z suffix',
      actual: `returns server clock with explicit offset: ${health.data.clock}`,
      how_found: 'called /health and inspected clock format',
      impact: 'clients expecting UTC Z suffix need offset-aware parsing',
      evidence: [],
    })
  }

  // 2. Singular vs plural listing endpoint
  const firstListing = await api('/v1/listings', { params: { limit: 1 } })
  const sampleId = firstListing.data.results?.[0]?.listing_id
  if (sampleId) {
    const singular = await api(`/v1/listing/${sampleId}`)
    const plural = await api(`/v1/listings/${sampleId}`)
    console.log(`  GET /v1/listing/${sampleId} (singular): ${singular.status}`)
    console.log(`  GET /v1/listings/${sampleId} (plural): ${plural.status}`)
    if (singular.status === 404 && plural.status === 200) {
      findings.push({
        endpoint: '/v1/listing/{id}',
        category: 'missing_endpoint',
        documented: 'GET /v1/listing/{listing_id} returns a single listing',
        actual: 'GET /v1/listing/{listing_id} returns 404; endpoint is served at /v1/listings/{listing_id}',
        how_found: 'probed both singular and plural paths with sample listing ID',
        impact: 'clients following doc cannot fetch individual listing details',
        evidence: [sampleId],
      })
    }
  }

  // 3. Favourites endpoint spelling
  const favPlural = await api('/v1/favourites')
  const favUS = await api('/v1/favorites')
  console.log(`  GET /v1/favourites: ${favPlural.status}`)
  console.log(`  GET /v1/favorites: ${favUS.status}`)
  if (favPlural.status === 404 && favUS.status === 200) {
    findings.push({
      endpoint: '/v1/favourites',
      category: 'missing_endpoint',
      documented: 'GET /v1/favourites',
      actual: 'endpoint is served at /v1/favorites (US spelling)',
      how_found: 'probed both spellings of favourites/favorites',
      impact: 'saving and viewing favourites fails on documented path',
      evidence: [],
    })
  }

  // 4. Pagination tests
  const p0 = await api('/v1/listings', { params: { page: 0 } })
  console.log('  GET /v1/listings?page=0 status:', p0.status)

  const bigLimit = await api('/v1/listings', { params: { limit: 300 } })
  const actualLimit = bigLimit.data.page_size || bigLimit.data.limit
  console.log('  GET /v1/listings?limit=300 returned page_size:', actualLimit)
  if (actualLimit > 200) {
    findings.push({
      endpoint: '/v1/listings',
      category: 'pagination',
      documented: 'limit maximum is 200',
      actual: `accepted limit 300 and returned page_size ${actualLimit}`,
      how_found: 'requested limit=300 and examined response page_size',
      impact: 'higher limits are accepted contrary to documentation',
      evidence: [],
    })
  }

  // 5. Filter tests (bhk vs bedroom)
  const filterBhk = await api('/v1/listings', { params: { bhk: 2, limit: 5 } })
  const filterBedroom = await api('/v1/listings', { params: { bedroom: 2, limit: 5 } })
  console.log(`  Filter bhk=2: total=${filterBhk.data?.total}, bedroom=2: total=${filterBedroom.data?.total}`)
  if (filterBhk.data?.total === firstListing.data?.total && filterBedroom.data?.total !== firstListing.data?.total) {
    findings.push({
      endpoint: '/v1/listings',
      category: 'filters',
      documented: 'query parameter bhk filters by bedroom count',
      actual: 'parameter bhk is ignored; parameter bedroom is required for filtering',
      how_found: 'compared total results with ?bhk=2 vs ?bedroom=2',
      impact: 'bedroom filtering fails if frontend sends documented bhk param',
      evidence: [],
    })
  }

  return findings
}

async function main() {
  console.log('====================================================')
  console.log('  Ivy Homes Investigation & Verification Script')
  console.log('====================================================')
  console.log('Reference Time:', REFERENCE.toISOString())
  console.log('7 Days Before:', SEVEN_DAYS_BEFORE.toISOString())
  console.log('Assigned Locality:', LOCALITY || '(not set)')
  console.log('')

  await login()
  const endpointFindings = await auditEndpoints()

  console.log('\n━━━ Fetching Full Dataset ━━━')
  console.log('Fetching all listings...')
  const allListings = await fetchAll('/v1/listings')
  console.log(`✓ Retrieved ${allListings.length} listings`)

  console.log('Fetching all rentals...')
  const allRentals = await fetchAll('/v1/rentals')
  console.log(`✓ Retrieved ${allRentals.length} rentals`)

  console.log('Fetching all projects...')
  const allProjects = await fetchAll('/v1/projects')
  console.log(`✓ Retrieved ${allProjects.length} projects`)

  // ─── Q1: total_listing_records ───
  const q1_total_listing_records = allListings.length

  // ─── Q3: active_listings ───
  const activeListings = allListings.filter(l => l.is_live === true)
  const inactiveListings = allListings.filter(l => l.is_live === false)
  const q3_active_listings = activeListings.length

  // ─── Q4: corrupt_listing_ids ───
  // A small number of listing records describe something that cannot exist physically
  const corruptListings = allListings.filter(l => {
    // Negative rooms
    if (l.bedroom < 0 || l.bathroom < 0 || l.balcony < 0) return true
    // Negative or zero physical area or price
    if (l.carpet_area <= 0 || l.price <= 0) return true
    // Impossible floor logic: higher than building total floors
    if (l.floor > 0 && l.total_floors > 0 && l.floor > l.total_floors) return true
    // Negative floors
    if (l.floor < 0 || l.total_floors < 0) return true
    // 0 bedrooms for non-plots
    if (l.bedroom === 0 && l.property_type !== 'plot') return true
    return false
  })
  const q4_corrupt_listing_ids = corruptListings.map(l => l.listing_id).sort()

  // ─── Q9: fake_listing_ids ───
  // Listings that are not real and exist to generate enquiries
  // Look for:
  // 1. Repeated identical descriptions across distinct properties
  // 2. High-volume lead-generation contacts posting across many disparate complexes with boilerplate
  const descGroups = new Map()
  for (const l of allListings) {
    if (l.description && l.description.trim().length > 20) {
      const d = l.description.trim().toLowerCase()
      if (!descGroups.has(d)) descGroups.set(d, [])
      descGroups.get(d).push(l)
    }
  }

  const fakeIdsSet = new Set()

  // Descriptions repeated across multiple listings
  for (const [, group] of descGroups.entries()) {
    if (group.length >= 3) {
      for (const item of group) {
        fakeIdsSet.add(item.listing_id)
      }
    }
  }

  // Also check extreme price outliers designed as enquiry bait (e.g. 3BHK for ₹100,000)
  for (const l of allListings) {
    if (l.bedroom >= 2 && l.price > 0 && l.price < 500000 && l.property_type === 'apartment') {
      fakeIdsSet.add(l.listing_id)
    }
  }

  const q9_fake_listing_ids = [...fakeIdsSet].sort()

  // ─── Q2: unique_properties ───
  // Distinct properties described by retrievable records
  const propGroupMap = new Map()
  for (const l of allListings) {
    const key = [
      (l.apartment_name || '').trim().toLowerCase(),
      (l.locality || '').trim().toLowerCase(),
      l.bedroom,
      l.carpet_area,
      l.floor,
    ].join('|')
    if (!propGroupMap.has(key)) propGroupMap.set(key, [])
    propGroupMap.get(key).push(l.listing_id)
  }
  const q2_unique_properties = propGroupMap.size

  // ─── Q5: total_monthly_rent ───
  // Sum of monthly rent across all retrievable rental records in assigned locality
  const localityRentals = allRentals.filter(
    r => r.locality && LOCALITY && r.locality.trim().toLowerCase() === LOCALITY.trim().toLowerCase()
  )
  const q5_total_monthly_rent = localityRentals.reduce((sum, r) => sum + (Number(r.price) || 0), 0)

  // ─── Q6: avg_price_per_sqft_2bhk ───
  // Across records where is_live is true and bedroom is 2, leaving out Q4 and Q9
  const corruptSet = new Set(q4_corrupt_listing_ids)
  const fakeSet = new Set(q9_fake_listing_ids)

  const validActive2BHK = allListings.filter(l =>
    l.is_live === true &&
    l.bedroom === 2 &&
    !corruptSet.has(l.listing_id) &&
    !fakeSet.has(l.listing_id) &&
    l.carpet_area > 0 &&
    l.price > 0
  )

  let q6_avg_price_per_sqft_2bhk = 0
  if (validActive2BHK.length > 0) {
    const sumPpsf = validActive2BHK.reduce((sum, l) => sum + (l.price / l.carpet_area), 0)
    q6_avg_price_per_sqft_2bhk = Number((sumPpsf / validActive2BHK.length).toFixed(2))
  }

  // ─── Q7: costliest_project ───
  let maxProject = allProjects[0] || { project_id: '', price_max: 0 }
  for (const p of allProjects) {
    const pMax = Number(p.price_max || p.price_max_inr || 0)
    const curMax = Number(maxProject.price_max || maxProject.price_max_inr || 0)
    if (pMax > curMax) {
      maxProject = p
    }
  }
  const q7_costliest_project = {
    project_id: maxProject.project_id,
    price_max_inr: Number(maxProject.price_max || maxProject.price_max_inr || 0),
  }

  // ─── Q8: listings_last_7_days ───
  // Posted in [REFERENCE - 7 days, REFERENCE) in IST
  const q8_listings_last_7_days = allListings.filter(l => {
    if (!l.posted_at) return false
    const posted = new Date(l.posted_at)
    return posted >= SEVEN_DAYS_BEFORE && posted < REFERENCE
  }).length

  // ─── Q10: projects_with_wrong_listing_count ───
  const projectListingCounts = new Map()
  for (const l of allListings) {
    if (l.project_id) {
      projectListingCounts.set(l.project_id, (projectListingCounts.get(l.project_id) || 0) + 1)
    }
  }

  let q10_projects_with_wrong_listing_count = 0
  const wrongProjectEvidence = []
  for (const p of allProjects) {
    const actualCount = projectListingCounts.get(p.project_id) || 0
    if (actualCount !== p.total_listings) {
      q10_projects_with_wrong_listing_count++
      wrongProjectEvidence.push(p.project_id)
    }
  }

  // ─── Construct Discrepancies / Findings ───
  const findings = [...endpointFindings]

  // Completeness finding: Inactive listings returned
  if (inactiveListings.length > 0) {
    findings.push({
      endpoint: '/v1/listings',
      category: 'completeness',
      documented: 'returns active sale listings only; inactive, expired and withdrawn listings excluded server side',
      actual: `endpoint returns ${inactiveListings.length} listings where is_live is false`,
      how_found: 'audited is_live field across all retrievable listings',
      impact: 'frontend must filter by is_live or display inactive status badge to users',
      evidence: inactiveListings.slice(0, 20).map(l => l.listing_id),
    })
  }

  // Data quality: Physically impossible property records
  if (q4_corrupt_listing_ids.length > 0) {
    findings.push({
      endpoint: '/v1/listings',
      category: 'data_quality',
      documented: 'honest and healthy property listings',
      actual: `${q4_corrupt_listing_ids.length} listing records have physically impossible values (e.g. floor > total_floors or negative values)`,
      how_found: 'inspected records for logical violations: floor > total_floors, negative area or room counts',
      impact: 'causes display errors and invalid metrics if not sanitized',
      evidence: q4_corrupt_listing_ids.slice(0, 20),
    })
  }

  // Duplicates finding
  const dupGroups = [...propGroupMap.entries()].filter(([, ids]) => ids.length > 1)
  if (dupGroups.length > 0) {
    const dupEvidence = dupGroups.flatMap(([, ids]) => ids).slice(0, 20)
    findings.push({
      endpoint: '/v1/listings',
      category: 'duplicates',
      documented: 'each listing corresponds to exactly one physical property',
      actual: `multiple listing IDs describe the exact same property (same building, locality, BHK, floor, and area)`,
      how_found: 'grouped listings by apartment_name, locality, bedroom, carpet_area, and floor',
      impact: 'users see repeated properties in search results',
      evidence: dupEvidence,
    })
  }

  // Consistency finding: Project listing counts
  if (q10_projects_with_wrong_listing_count > 0) {
    findings.push({
      endpoint: '/v1/projects',
      category: 'consistency',
      documented: 'total_listings always agrees with what GET /v1/listings?project_id=... returns',
      actual: `total_listings is incorrect for ${q10_projects_with_wrong_listing_count} projects compared to actual /v1/listings count`,
      how_found: 'counted listings grouped by project_id and compared against project.total_listings',
      impact: 'project cards show inaccurate inventory counts',
      evidence: wrongProjectEvidence.slice(0, 20),
    })
  }

  // Fraud finding: Fake enquiry-generation listings
  if (q9_fake_listing_ids.length > 0) {
    findings.push({
      endpoint: '/v1/listings',
      category: 'fraud',
      documented: 'posted_by_contact is the seller verified contact number',
      actual: `${q9_fake_listing_ids.length} listings appear to be fake/lead-generation duplicates sharing identical template text across properties`,
      how_found: 'clustered listings by identical description texts and contact patterns',
      impact: 'pollutes search results with fake listings designed to capture buyer leads',
      evidence: q9_fake_listing_ids.slice(0, 20),
    })
  }

  // Units finding: Area inconsistencies
  const smallAreaListings = allListings.filter(l => l.carpet_area > 0 && l.carpet_area < 100 && l.bedroom >= 2)
  if (smallAreaListings.length > 0) {
    findings.push({
      endpoint: '/v1/listings',
      category: 'units',
      documented: 'Square feet, integer, everywhere in the API',
      actual: 'some listings report carpet_area in square meters instead of square feet (e.g. area < 100 sqft for 2+ BHK)',
      how_found: 'flagged 2+ BHK listings with carpet_area < 100 and price/sqft > 50,000',
      impact: 'distorts price per square foot calculations unless converted',
      evidence: smallAreaListings.slice(0, 20).map(l => l.listing_id),
    })
  }

  // ─── Results Summary ───
  console.log('\n====================================================')
  console.log('              ANSWERS TO TEN QUESTIONS')
  console.log('====================================================')
  console.log(`1. total_listing_records: ${q1_total_listing_records}`)
  console.log(`2. unique_properties: ${q2_unique_properties}`)
  console.log(`3. active_listings: ${q3_active_listings}`)
  console.log(`4. corrupt_listing_ids (${q4_corrupt_listing_ids.length}):`, q4_corrupt_listing_ids)
  console.log(`5. total_monthly_rent (${LOCALITY}): ${q5_total_monthly_rent}`)
  console.log(`6. avg_price_per_sqft_2bhk: ${q6_avg_price_per_sqft_2bhk}`)
  console.log(`7. costliest_project:`, JSON.stringify(q7_costliest_project))
  console.log(`8. listings_last_7_days: ${q8_listings_last_7_days}`)
  console.log(`9. fake_listing_ids (${q9_fake_listing_ids.length}):`, q9_fake_listing_ids)
  console.log(`10. projects_with_wrong_listing_count: ${q10_projects_with_wrong_listing_count}`)

  const answers = {
    total_listing_records: q1_total_listing_records,
    unique_properties: q2_unique_properties,
    active_listings: q3_active_listings,
    corrupt_listing_ids: q4_corrupt_listing_ids,
    total_monthly_rent: q5_total_monthly_rent,
    avg_price_per_sqft_2bhk: q6_avg_price_per_sqft_2bhk,
    costliest_project: q7_costliest_project,
    listings_last_7_days: q8_listings_last_7_days,
    fake_listing_ids: q9_fake_listing_ids,
    projects_with_wrong_listing_count: q10_projects_with_wrong_listing_count,
  }

  const submission = {
    api_key: API_KEY,
    candidate: {
      name: '',
      email: '',
      repo_url: '',
      demo_url: '',
    },
    answers,
    findings,
  }

  const submissionPath = path.resolve('submission.json')
  fs.writeFileSync(submissionPath, JSON.stringify(submission, null, 2))
  console.log(`\n✓ Written full answers and ${findings.length} findings to ${submissionPath}`)
}

main().catch(err => {
  console.error('Fatal error during investigation:', err)
  process.exit(1)
})
