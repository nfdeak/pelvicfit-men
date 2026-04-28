# PelvicFit Men — Project Status & Session Summary

> **Last Updated:** April 28, 2026  
> **Production:** [pelvicfit.xyz](https://pelvicfit.xyz)  
> **Repository:** [github.com/Vaibhavcste/pelvicfit-men](https://github.com/Vaibhavcste/pelvicfit-men)  
> **Branch:** `main`

---

## 1. Project Overview

PelvicFit is a digital product (28-day pelvic floor exercise protocol) sold to men at $19.97 via a quiz funnel. Traffic comes from Meta (Facebook/Instagram) ads targeting US males 22-65+.

### Revenue Model
- **Core product:** $19.97 one-time (Premium Plan — 28-day protocol)
- **Upsell:** $29.97 (Complete Wellness Bundle — 12-week advanced + nutrition + breathing)
- **Downsell:** $9.97 (Starter Plan — 2-week basic)
- **Revenue after Stripe fees:** ~$19.09 per core sale

---

## 2. Infrastructure & Credentials

### Hosting & Deployment
- **Vercel Project:** `celestial-sagan` → custom domain `pelvicfit.xyz`
- **GitHub:** `Vaibhavcste/pelvicfit-men` (branch: `main`)
- **Deployment:** Push to `main` → auto-deploys via Vercel

### Tracking
| Service | ID |
|---------|-----|
| Meta Pixel | `27117930631145953` |
| GA4 | `G-PGMSSLBB9W` |
| Microsoft Clarity | `wgl0uzj2nj` |

### APIs & Env Vars (Vercel Production)
| Variable | Purpose |
|----------|---------|
| `BREVO_API_KEY` | Email automation (Brevo/Sendinblue) |
| `BREVO_LIST_UNPAID` | List 4 — unpaid leads |
| `BREVO_LIST_CUSTOMERS` | List 5 — paid customers |
| `GOOGLE_SHEETS_ID` | `1HmvXtym_aBN85786-oLbuznCr5R7v6TxKtD_KE3i72I` |
| `GOOGLE_SERVICE_ACCOUNT` | `carbon-pride-374002` service account JSON |

### Stripe Payment Links
| Product | Price | Link ID (suffix) |
|---------|-------|-------------------|
| Premium Plan | $19.97 | `...81yb3q01` |
| Wellness Bundle | $29.97 | `...95Cb3q02` |
| Starter Plan | $9.97 | `...fu0b3q00` |

All payment links redirect to `https://pelvicfit.xyz?stripe_return=success&type={tier}` after payment (configured in Stripe Dashboard).

---

## 3. Current Architecture

### File Structure
```
PF/
├── index.html                ← Main quiz funnel (25-step SPA, ~1,650 lines)
├── lp/index.html             ← Landing Page Variant B (premium/clinical)
├── lp2/index.html            ← Landing Page Variant C (ugly/raw direct-response)
├── plan/index.html           ← 28-day protocol dashboard
├── api/
│   ├── submit-quiz.js        ← Lead capture → Brevo + Google Sheets
│   ├── create-protocol.js    ← Post-payment → token gen + customer activation
│   └── protocol.js           ← Token validation
├── content/                  ← Protocol JSONs (firmness, endurance, bladder, libido)
│   └── images/               ← 14 exercise illustrations
├── ads/                      ← Ad performance CSVs and creatives
│   ├── data 24-04/
│   ├── data 25-04/
│   ├── 26-04/
│   └── infographics/
├── scripts/
│   ├── check-sheet.js        ← Google Sheets diagnostic script
│   ├── map-images.js         ← Exercise → image mapper
│   └── dev-server.js         ← Local dev server
├── docs/                     ← Documentation (this folder)
├── privacy.html
├── terms.html
├── vercel.json
└── package.json              ← Dependencies: googleapis
```

### Data Flow
```
Meta Ad → Landing Page (LP1/LP2/LP3)
  → Quiz (pelvicfit.xyz) — 25 steps
    → Email capture (Step 22)
      → API: submit-quiz.js
        → Brevo: create/update contact (List 4: Unpaid Leads)
        → Google Sheet: append row (analytics)
        → Send "Results Ready" email
    → Results screen → "GET MY PLAN" button
      → Stripe Checkout ($19.97)
        → Success redirect → Upsell screen
          → API: create-protocol.js
            → Brevo: move to List 5 (Customers)
            → Generate access token
            → Send protocol access email
```

---

## 4. Ad Campaign History & Performance

### Phase 1: Initial CBO Campaign (Apr 19–24)
- **Budget:** $10/day CBO
- **Creatives:** 5 static ads + 2 video ads (interview-style)
- **Results:** $38 spent, 0 purchases
- **Key metrics:** Video ads performed best (CTR 7-14%, CPC $0.22-$0.44), static ads killed early
- **Learnings:** ~30% drop-off between link clicks and landing page views; funnel/LP issue identified

### Phase 2: Landing Page Optimization (Apr 24)
Built and deployed 3 landing page variants for A/B testing:

| Variant | URL | Style | Description |
|---------|-----|-------|-------------|
| A: Quiz Direct | `pelvicfit.xyz` | Dark, interactive | Straight to quiz, no pre-sell |
| B: Premium LP | `pelvicfit.xyz/lp/` | Dark, clinical | Infographics, study citations, trust badges, pills-vs-protocol table |
| C: Ugly/Raw LP | `pelvicfit.xyz/lp2/` | Cream, serif font | ClickFunnels-style sales letter, red headlines, yellow highlights, price anchoring |

**Work done on LP upgrade (Variant B):**
- Generated clinical anatomy and hypertonic-vs-healthy infographics
- Added trust bar (Clinical Trials · Money-Back Guarantee · Secure Checkout)
- Added research citations (Dorey 2005 BJU International, J Sexual Medicine 2016)
- Added pills-vs-protocol comparison table
- Added payment security badges (SSL, Stripe, Guarantee, Research Backed)

**Work done on Ugly LP (Variant C):**
- Long-form sales letter in Georgia serif font
- Red "ATTENTION" banner, yellow highlighted phrases
- Price anchor ($1,200 physio crossed out → $19.97)
- 14-day money-back guarantee box
- FAQ section
- 6 CTAs throughout the page

### Phase 3: ABO LP Test Campaign (Apr 24–ongoing)
- **Type:** ABO (Advantage Budget Optimization off — manual per ad set)
- **Budget:** $7/day per ad set × 3 = $21/day
- **Same creative** across all 3 ad sets; only URL changes
- **Ad set naming:** PV-LP1 (quiz direct), PV-LP2 (premium LP), PV-LP3 (ugly LP)

#### Performance (Apr 24–26)

| Metric | PV-LP1 (Quiz) | PV-LP2 (Premium) | PV-LP3 (Ugly) |
|--------|:---:|:---:|:---:|
| Reach | 235 | 226 | 198 |
| Link Clicks | 12 | 9 | **14** ✅ |
| CPC | $1.61 | $2.01 | **$1.19** ✅ |
| CTR | 5.0% | 3.78% | **6.86%** ✅ |
| LP Views | 8 | 10 | 8 |
| Purchases | 0 | 0 | **1** 🎉 |
| CPA | — | — | **$16.60** |
| Spend | $19.26 | $18.11 | $16.60 |

**Key finding:** LP3 (ugly page) got the first purchase and leads all metrics.

### Financial Summary (as of Apr 26)
| Item | Amount |
|------|--------|
| Previous CBO campaign | ~$38 |
| ABO LP test campaign | ~$54 |
| **Total ad spend** | **~$92** |
| **Revenue (1 purchase)** | **$19.97** |
| **Net P&L** | **-$72** |
| **Leads collected** | 5+ emails |

### Kill Threshold
| Total Spend | Leads | Purchases | Action |
|-------------|-------|-----------|--------|
| ~$92 (current) | 5 | 1 | ✅ Continue — signal exists |
| $150 | ~15 | 0-1 | Evaluate — try lower price if 0 |
| $200 | ~20+ | 0 | Kill or major pivot |

---

## 5. Integrations Added (Apr 24–27)

### Microsoft Clarity (Apr 24)
- Installed on all pages (`index.html`, `lp/index.html`, `lp2/index.html`)
- Project ID: `wgl0uzj2nj`
- Session recordings available at [clarity.microsoft.com](https://clarity.microsoft.com)

### Google Sheets Quiz Analytics (Apr 27)
- **Sheet:** [PelvicFit Quiz Data](https://docs.google.com/spreadsheets/d/1HmvXtym_aBN85786-oLbuznCr5R7v6TxKtD_KE3i72I)
- **Service Account:** `py-bot@carbon-pride-374002.iam.gserviceaccount.com`
- **Integration:** Every quiz email submission → appends row to Sheet1

#### Columns Tracked
| Column | Field | Purpose |
|--------|-------|---------|
| A | Timestamp | When quiz was completed |
| B | Email | Lead email |
| C | Goal | What they want to fix (Stop PE / Firmness / Libido / Bladder) |
| D | Primary Focus | Firmness / Endurance / Pleasure |
| E | Experience | Beginner / Intermediate / Advanced |
| F | Daily Time | <5 min / 5-10 min / 10-20 min / 20+ min |
| G | Score | Generated PF strength score (3.0-4.5) |
| H | Landing Page | quiz_direct / lp_premium / lp2_ugly |
| I | UTM Content | From ad URL parameter |
| J | Referrer | document.referrer |
| K | Status | lead / purchased |

#### Bug Fixed (Apr 27)
- Sheets integration was silently failing on Vercel
- **Root cause 1:** `GOOGLE_SHEETS_ID` env var had trailing newline from `<<<` heredoc → fixed with `.trim()`
- **Root cause 2:** Private key `\n` characters double-escaped by Vercel → fixed with `.replace(/\\n/g, '\n')`
- **Verification:** API response now includes `"sheet": {"ok": true, "range": "..."}` diagnostic

### Brevo Contact Attributes
All quiz data is also stored as Brevo contact attributes:
```
GOAL, PRIMARY_FOCUS, EXPERIENCE, DAILY_TIME, SCORE,
QUIZ_DATE, QUIZ_ANSWERS (JSON), LANDING_PAGE,
UTM_SOURCE, UTM_CONTENT, REFERRER, STATUS
```

### Brevo Email Automation
- Abandoned cart email sequences already configured in Brevo
- Results email sent automatically on quiz completion
- Post-purchase protocol access email sent via `create-protocol.js`

---

## 6. Profitability Math

### Breakeven Requirements
```
Revenue per sale:     $19.97
Stripe fees:         -$0.88  (2.9% + $0.30)
Net per sale:         $19.09

Breakeven CPC at various conversion rates:
  1% click→purchase: max CPC = $0.19  ← very tight
  2% click→purchase: max CPC = $0.38  ← possible with video ads
  3% click→purchase: max CPC = $0.57  ← achievable
  5% click→purchase: max CPC = $0.95  ← comfortable
```

### Target Metrics
| Metric | 🔴 Bad | 🟢 Target | Current Best |
|--------|--------|-----------|--------------|
| CPC | > $1.00 | < $0.50 | $1.19 (LP3) |
| CTR | < 2% | > 5% | 6.86% ✅ |
| Click → LP View | < 70% | > 85% | 100% (LP2) |
| Cost per Lead | > $5 | < $2 | ~$12 (needs work) |
| CPA | > $19.97 | < $10 | $16.60 (thin) |

### Path to Profitability
1. **Fix the funnel** — improve LP→quiz→purchase conversion rate
2. **Email sequences** — recover abandoned leads (5 leads, 0 converted via email yet)
3. **Increase AOV** — if 30% take upsell, average order = ~$29 → doubles margin

---

## 7. Funnel Insights (from Clarity)

- **One user** came from LP2 (ugly page), completed entire quiz, reached results page with "GET MY PLAN", clicked it → saw Stripe checkout → hit browser back → returned to quiz start
- This user did NOT pay — they bounced at the Stripe paywall
- **Insight:** Funnel works end-to-end, but the jump from "free quiz" to "$19.97 payment" is too abrupt
- **Fix ideas:** better price anchoring before results page, working countdown timer (currently shows 00:00), stronger urgency copy

---

## 8. Pending Work (Prioritized)

### P0 — Critical
- [ ] **Monitor LP test data** — let ABO campaign run to $150 total. Compare quiz starts, email captures, and purchases per LP variant
- [ ] **Analyze Google Sheet data** — once 20+ leads, identify most common goal/pain point → create targeted ad creatives
- [ ] **Fix countdown timer** — Clarity shows timer at 00:00 on results page (kills urgency)

### P1 — High Value
- [ ] **Build Variant D: VSL page** at `/lp3/` — faceless video sales letter (3-5 min). Script structure: Problem → Mechanism → Solution → Proof → Offer → Guarantee
- [ ] **Lower-price test** — if $150 spend with ≤1 purchase, test $9.97 entry price
- [ ] **Retargeting campaign** — create custom audience from LP visitors for warm traffic

### P2 — Nice to Have
- [ ] **Update STATUS column in Sheet** — when someone purchases, update their row from "lead" to "purchased" (currently manual)
- [ ] **Export Clarity data** — set up weekly Clarity segment analysis by LP source
- [ ] **New ad creatives** — based on Sheet data (e.g., if 80% want "Stop PE" → make PE-focused ads)

---

## 9. Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| **ABO over CBO** for LP test | Equal budget per LP ($7/day each), no algorithm skewing |
| **3 LP variants** (quiz, premium, ugly) | Test range from slick-brand to raw-direct-response |
| **Google Sheets over standalone DB** | Easy filtering/pivoting, no extra infra, reuses existing service account |
| **Brevo + Sheets dual write** | Brevo for automation, Sheets for analytics — best of both |
| **Ugly page first purchase** | Text-heavy, credibility-focused pages outperform polished designs for cold traffic |
| **$150 kill threshold** | 3× product price × ~2.5× buffer for statistical significance |

---

## 10. Quick Reference Commands

```bash
# Deploy
cd /Users/vaibhavthakur/Desktop/python2026/sidehustle/PF
git add -A && git commit -m "your message" && git push origin main

# Check Google Sheet data
node scripts/check-sheet.js

# Check Vercel env vars
npx vercel env ls production

# Test quiz submission API
curl -s -X POST https://pelvicfit.xyz/api/submit-quiz \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","quizData":{"goal":"Stop PE"}}' | python3 -m json.tool

# View Vercel function logs
npx vercel logs pelvicfit.xyz
```

---

## 11. Files Modified in This Session (Apr 20–28)

| File | What Changed |
|------|-------------|
| `index.html` | Added Clarity tracking; added UTM + landing_page capture to quiz payload |
| `lp/index.html` | Created premium LP with infographics, trust signals, study citations |
| `lp2/index.html` | Created ugly/raw direct-response LP |
| `api/submit-quiz.js` | Added Google Sheets integration, expanded Brevo attributes, diagnostic logging |
| `package.json` | Added `googleapis` dependency |
| `.gitignore` | Added `docs/MASTER_REFERENCE.md` (contains API keys) |

---

*This document serves as the handoff for new conversations. Read this + `docs/BUILD_LOG.md` + `docs/MASTER_REFERENCE.md` to get full context.*
