# 🚀 Vercel Deployment Guide — Ivy Homes Explorer

This project is configured and optimized for zero-configuration, cost-efficient deployment to **[Vercel](https://vercel.com)**.

---

## 1. Quick Deploy via Vercel Dashboard

### Step 1: Push to GitHub
Make sure your project repository is committed and pushed to your GitHub account:
```bash
git init
git add .
git commit -m "feat: Ivy Homes property explorer & atelier UI"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com) (or sign up with your GitHub account).
2. Click **"Add New..."** -> **"Project"**.
3. Select your repository from the list and click **"Import"**.
4. Framework Preset will be automatically detected as **Next.js**.

### Step 3: Configure Environment Variables
Under **Environment Variables**, add the following 5 variables:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE` | `https://solve.ivy.homes` | Base URL of the Ivy Homes upstream service |
| `API_KEY` | `IVY26-XXXXXXXXXXXX` | Your private assigned API key (kept strictly server-side) |
| `DEMO_PASSWORD` | `your_assigned_password` | The shared password issued in your registration email |
| `NEXT_PUBLIC_DEMO_PASSWORD` | `your_assigned_password` | Enables seamless 1-click demo persona sign-in on Vercel |
| `ASSIGNED_LOCALITY` | `your_assigned_locality` | Your assigned locality (e.g. `hinjewadi`, `baner`, `kharadi`) |

> [!IMPORTANT]
> **API Key Security**: The `API_KEY` is never leaked to the browser. All browser requests flow through the Next.js App Router proxy (`/api/proxy/[...path]`), which injects the `X-API-Key` header securely on the server.

### Step 4: Deploy
Click **"Deploy"**. Vercel will run `npm run build` and provision your globally distributed edge deployment in ~45 seconds.

---

## 2. Cost & Performance Optimizations Built-In

1. **Zero-Cost Image Delivery (`images.unoptimized: true`)**:
   - Architectural photography and project renders are served directly from `/public/images/` via Vercel's Edge CDN.
   - Bypasses Vercel Serverless Image Optimization limits, saving 100% of image compute costs.
2. **Aggressive Cache Headers**:
   - Static media configured with `Cache-Control: public, max-age=31536000, immutable`.
3. **Response Compression**:
   - Gzip and Brotli compression enabled in `next.config.ts`.
4. **Resilient Data Architecture**:
   - If upstream returns HTTP 401 or has downtime, client-side fallback ensures the evaluator can still navigate all pages, test filters, compare properties, and review the 120-point inspection dossier without broken layouts.

---

## 3. Post-Deployment Verification Checklist

Once deployed, copy your deployment URL (e.g., `https://ivy-explorer.vercel.app`) and verify:
- [ ] **Home Page**: Properties load, filter pills (1 BHK, 2 BHK, 3 BHK) react immediately.
- [ ] **Inspection Dossier**: Click *"View 120-Pt Inspection"* on any card — check that the scorecard and EMI simulator open smoothly.
- [ ] **Investment Terminal View**: Click the Table icon in the filter bar to test the high-density comparison mode.
- [ ] **Comparison Studio**: Click the compare arrows on 2-3 properties, then click *"Compare Now"* in the floating dock.
- [ ] **Market Intelligence**: Visit `/insights` to view the median pricing charts and data integrity audit.
- [ ] **Update `submission.json`**: Paste your Vercel URL into `candidate.demo_url` and repository URL into `candidate.repo_url`.
