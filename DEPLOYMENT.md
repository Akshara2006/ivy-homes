# 🚀 Vercel Deployment Guide — Ivy Homes Explorer

This project is configured and optimized for zero-configuration, cost-efficient deployment to **[Vercel](https://vercel.com)**.

---

## 1. Quick Deploy via Vercel Dashboard

### Step 1: Push to GitHub
Ensure all your latest changes are pushed to your repository:
```bash
git add .
git commit -m "docs: update deployment and submission documentation"
git push origin main
```
*Repository*: `https://github.com/Akshara2006/ivy-homes`

### Step 2: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com) (or sign up with your GitHub account).
2. Click **"Add New..."** -> **"Project"**.
3. Select `Akshara2006/ivy-homes` from the list and click **"Import"**.
4. Framework Preset is automatically detected as **Next.js**.

### Step 3: Configure Environment Variables
Under **Environment Variables**, add the 5 variables configured in your `.env.local`:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE` | `https://solve.ivy.homes` | Base URL of the Ivy Homes upstream service |
| `API_KEY` | `IVY26-8C9F84EEF98D` | Your private assigned API key (kept strictly server-side) |
| `DEMO_PASSWORD` | `a611f561de` | The shared password issued in your registration email |
| `NEXT_PUBLIC_DEMO_PASSWORD` | `a611f561de` | Enables seamless 1-click demo persona sign-in on Vercel |
| `ASSIGNED_LOCALITY` | `Baner` | Your assigned locality |

> [!IMPORTANT]
> **API Key Security**: The `API_KEY` is never leaked to the browser. All browser requests flow through the Next.js App Router proxy (`/api/proxy/[...path]`), which injects the `X-API-Key` header securely on the server.

### Step 4: Deploy
Click **"Deploy"**. Vercel will run `pnpm run build` and provision your globally distributed edge deployment in ~35 seconds.

---

## 2. Cost & Performance Optimizations Built-In

1. **Zero-Cost Image Delivery (`images.unoptimized: true`)**:
   - Architectural photography and project renders are served directly from `/public/images/` via Vercel's Edge CDN.
   - Bypasses Vercel Serverless Image Optimization limits, saving 100% of image compute costs.
2. **Aggressive Cache Headers**:
   - Static media configured with `Cache-Control: public, max-age=31536000, immutable`.
3. **Response Compression**:
   - Gzip and Brotli compression enabled in `next.config.ts`.
4. **API Proxy Normalization**:
   - Handles `bhk -> bedroom` translation, compound `sort_by` decomposition, and `page -> offset` translation server-side before reaching upstream.

---

## 3. Post-Deployment Verification Checklist

Once deployed, copy your deployment URL (e.g., `https://ivy-homes-xxx.vercel.app`) and verify:
- [ ] **Default Login Gate**: Visiting the home page presents the Ivy Homes sign-in screen by default before granting access.
- [ ] **1-Click Persona Login**: Click `Demo 1: Buyer` to log in instantly.
- [ ] **Resale Homes & Pagination**: Page 1 and Page 2 load distinct verified listings smoothly.
- [ ] **120-Point Inspection Dossier**: Click *"View 120-Pt Inspection"* on any card to review technical scorecards and the EMI calculator.
- [ ] **Investment Terminal View**: Click the Table icon in the filter bar to test the high-density grid.
- [ ] **Comparison Studio**: Click compare on 2-3 properties and verify the side-by-side comparison matrix.
- [ ] **Market Intelligence**: Visit `/insights` to view live pricing charts and data integrity metrics.
- [ ] **Update `submission.json`**: Paste your live Vercel URL into `candidate.demo_url` in `submission.json`.
