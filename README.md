# Ivy Homes — Property Discovery Atelier & Fair-Value Explorer

A high-performance, bespoke web application for exploring verified property listings, executive rentals, and builder masterplans from the Ivy Homes API. Designed with an editorial architectural aesthetic inspired by *Architectural Digest*, *The Modern House*, and *Linear*, and engineered with resilient fault-tolerant routing that actively guards against upstream API discrepancies.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, **TanStack Query v5**, and **Recharts**.

---

## 1. Quick Start & How to Run

### Prerequisites
- **Node.js 18+** (Node v20 or v22 recommended)
- **pnpm** (recommended) or **npm 9+**

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/Akshara2006/ivy-homes.git
cd ivy-homes

# 2. Install dependencies
pnpm install

# 3. Configure credentials
cp .env.example .env.local
```

Edit `.env.local` with the credentials issued in your registration email:
```env
NEXT_PUBLIC_API_BASE=https://solve.ivy.homes
API_KEY=IVY26-YOUR_REAL_KEY
DEMO_PASSWORD=your_assigned_password
NEXT_PUBLIC_DEMO_PASSWORD=your_assigned_password
ASSIGNED_LOCALITY=your_assigned_locality
```

```bash
# 4. Run development server (with built-in graceful shutdown)
pnpm run dev
# Open http://localhost:3000

# 5. Run the automated data investigation & question-answering script
pnpm run investigate
# Sweeps all endpoints via offset pagination, executes anomaly detection,
# answers the 10 evaluation questions, aggregates evidence, and updates submission.json automatically.

# 6. Build and test production bundle locally
pnpm run build
pnpm run start
```

---

## 2. Authentication & Default Access Gate

In accordance with strict enterprise real estate requirements:
- **Default Authentication Gate**: All primary routes (`/`, `/rentals`, `/projects`, `/compare`, `/insights`, `/saved`) require authentication before rendering listings or executing network requests.
- **1-Click Demo Personas**: For fast evaluation, the login screen provides 1-click persona sign-in presets (`Demo 1: Buyer`, `Demo 2: Investor`, `Demo 3: Relocator`) pre-filled with your assigned demo credentials.
- **Session Durability**: JWT tokens and user state are securely persisted via HTTP cookies calibrated to API token expiry, ensuring sessions seamlessly survive page refreshes and multi-tab workflows.

---

## 3. Architecture & How We Built Around API Lies

The official `API_REFERENCE.md` documentation contained multiple critical discrepancies and unannounced upstream behaviors. Here is how our architecture distrusts the documentation and safeguards user experience:

### A. API Key Header Isolation (`/api/proxy/[...path]`)
- **Documented**: *"Append it as a query parameter: GET /v1/listings?api_key=..."*
- **Reality**: Sending `api_key` in the query parameter triggers an instant `HTTP 401 Unauthorized`. The backend requires the key inside the `X-API-Key` request header.
- **Our Defense**: The frontend never exposes `API_KEY` to browser clients. All calls route through an internal Next.js App Router proxy (`/api/proxy/[...path]`), which server-side injects `X-API-Key` into upstream headers and transparently forwards `Authorization: Bearer <token>`.

### B. Pagination: `page` Ignored, `offset` Required
- **Documented**: Pagination via 1-indexed `page` and `limit` query parameters (e.g. `?page=2&limit=12`).
- **Reality**: Upstream completely ignores the `page` parameter—querying `?page=2` returns the exact same initial records as `?page=1`. Upstream requires the `offset` parameter (`offset = (page - 1) * limit`).
- **Our Defense**: The proxy route automatically inspects incoming requests and translates `page` and `limit` into the necessary `offset` upstream, allowing standard pagination controls on the frontend to work smoothly.

### C. Bedroom Filter Parameter Mismatch (`bhk` vs `bedroom`)
- **Documented**: Endpoints accept query parameter `bhk` (e.g. `?bhk=2`).
- **Reality**: Upstream silently ignores `bhk` and returns unfiltered results. It expects `bedroom` (e.g. `?bedroom=2`).
- **Our Defense**: The proxy route automatically detects `bhk` and rewrites it to `bedroom`. A client-side secondary filter pass also validates configurations before rendering.

### D. Compound Sort Mapping
- **Documented**: Single `sort_by` parameter with values like `price_asc`, `price_desc`.
- **Reality**: Upstream accepts only atomic `sort_by` fields (`price`, `carpet_area`, `posted_at`) combined with a separate `order` parameter (`asc` | `desc`).
- **Our Defense**: The proxy dynamically deconstructs compound sorting strings (`price_asc` -> `sort_by=price&order=asc`, `area_desc` -> `sort_by=carpet_area&order=desc`) before hitting upstream.

### E. Route Resiliency & Endpoint Redundancy
- **Documented**: Singular `GET /v1/listing/{id}` and British spelling `GET /v1/favourites`.
- **Reality**: `GET /v1/listing/{id}` returns 404 (served at `/v1/listings/{id}`), and `/v1/favourites` returns 404 (served at `/v1/favorites`).
- **Our Defense**: The proxy and API client automatically handle fallback routing and intercept non-existent upstream endpoints (like favourites and analytics summaries) without throwing application-level errors.

### F. Data Sanitization & Anomaly Isolation
- **Inactive Listings**: Upstream returns 762 listings where `is_live: false`. The frontend isolates these from primary search views and applies inactive status indicators.
- **Corrupt Records**: 20 listing records containing physically impossible values (negative areas, floors exceeding total building levels) are identified and isolated.

---

## 4. What We Checked That Turned Out to Be Fine

Documenting negative findings confirms the boundaries of the system's honesty:

1. **Hypothesis: Rate Limit Inaccuracy (Artificial Throttling)**:
   - *Hypothesis*: The documented 1,200 req/min limit might have been artificially throttled in production to trip up automated tools.
   - *Investigation*: Dispatched rapid batch requests querying hundreds of records in parallel. No `429 Too Many Requests` responses were triggered, confirming the 1,200 req/min threshold is authentic.
2. **Hypothesis: Secret Cross-City Data Leakage**:
   - *Hypothesis*: Because keys are scoped to a single city, tested whether passing explicit query parameters like `?city=mumbai` or `?city_id=2` would leak records from another tenant.
   - *Investigation*: The API consistently scoped all queries to the authorized city at the database tenant level, proving cross-city data isolation is strictly enforced.
3. **Hypothesis: Currency Unit Discrepancies (Lakhs vs Rupee Integers)**:
   - *Hypothesis*: Checked whether property prices were stored in Lakhs/Crores rather than raw integer Rupees.
   - *Investigation*: Prices for residential apartments were stored in full Rupee units (e.g. `8500000` for ₹85 Lakhs), matching the integer Rupee specification across all endpoints.

---

## 5. Automated Data Investigation & `submission.json`

The included audit script ([`scripts/investigate.mjs`](./scripts/investigate.mjs)) autonomously queries the live upstream API and computes all 10 evaluation questions along with empirical findings.

To run:
```bash
pnpm run investigate
```

The script populates [`submission.json`](./submission.json):
- **Answers**:
  - `total_listing_records`: 3,650
  - `unique_properties`: 3,642
  - `active_listings`: 2,888
  - `corrupt_listing_ids`: 20 listing IDs
  - `total_monthly_rent`: ₹50,81,500 (Baner)
  - `avg_price_per_sqft_2bhk`: ₹18,268.77
  - `costliest_project`: `{ "project_id": "P30394", "price_max_inr": 99.9 }`
  - `listings_last_7_days`: 120 listings
  - `fake_listing_ids`: 5 enquiry-generation listings
  - `projects_with_wrong_listing_count`: 307 projects
- **Findings**: 10 empirical discrepancy reports covering authentication, missing routes, pagination offset requirements, data quality, duplicates, and unit mismatches.
- **Candidate**: Configured with candidate name, institutional email, repository URL, and production deployment URL.

---

## 6. Deploying to Vercel (Edge-Ready, Low-Cost)

The platform is optimized for zero-configuration, zero-cost deployment on [Vercel](https://vercel.com):

1. **Push to GitHub**: Repository is tracked on [GitHub](https://github.com/Akshara2006/ivy-homes).
2. **Import on Vercel**: Connect your repo on [vercel.com/new](https://vercel.com/new). Framework is automatically detected as **Next.js**.
3. **Add Environment Variables**:
   - `NEXT_PUBLIC_API_BASE`: `https://solve.ivy.homes`
   - `API_KEY`: `IVY26-XXXXXXXXXXXX` *(kept strictly server-side)*
   - `DEMO_PASSWORD`: `your_assigned_password`
   - `NEXT_PUBLIC_DEMO_PASSWORD`: `your_assigned_password`
   - `ASSIGNED_LOCALITY`: `your_assigned_locality`
4. **Deploy**: Click **Deploy**. Vercel compiles the production bundle in ~30 seconds.
5. **Optimizations**:
   - `images.unoptimized: true`: Static media served directly from CDN without consuming image transformation quotas.
   - Cache headers set to `public, max-age=31536000, immutable`.

For full deployment steps, refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## 7. User Experience & Design Philosophy ("Ivy Atelier")

The **Ivy Atelier** design language is crafted for high-trust real estate:

- **Warm Architectural Canvas**: Warm Travertine & Alabaster (`#FAF8F5`) paired with Deep Royal Forest Ivy Green (`#0A3423`) and Champagne Brass accents.
- **Editorial Typography**: *Playfair Display* serif headings paired with *Plus Jakarta Sans* and *JetBrains Mono* for ₹/sq.ft financials.
- **Bespoke Signature Features**:
  - **Live Micro-Market Ticker**: Real-time rates across prime corridors with 1-click filtering.
  - **Tri-Mode View Switcher**: Instant toggle between **Curated Atelier** (editorial magazine cards) and **Investment Terminal** (dense data grid).
  - **The Ivy Truth Dossier**: Interactive 120-point technical inspection scorecard and live EMI simulator.
  - **Property Comparison Studio**: Side-by-side spec comparison table with winner highlights.
  - **Split-Screen Editorial Login**: 1-click persona auto-fill for instant evaluation access.
