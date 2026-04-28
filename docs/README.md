# PelvicFit Men — Master Documentation Index

> **Last Updated:** April 28, 2026  
> **Production:** [pelvicfit.xyz](https://pelvicfit.xyz)  
> **Repository:** [github.com/Vaibhavcste/pelvicfit-men](https://github.com/Vaibhavcste/pelvicfit-men)  
> **Branch:** `main`

---

## Documentation Map

| Document | Description |
|----------|-------------|
| [🚦 Project Status](./PROJECT_STATUS.md) | **START HERE** — complete state of ads, funnel, integrations, performance, and next steps |
| [📋 Master Reference](./MASTER_REFERENCE.md) | All credentials, APIs, file paths, architecture |
| [📝 Build Log](./BUILD_LOG.md) | Chronological log of everything built (Phase 0-7) |

---

## Quick Links

### Production URLs
- **Quiz Funnel:** https://pelvicfit.xyz
- **Premium Landing Page:** https://pelvicfit.xyz/lp/
- **Ugly/Raw Landing Page:** https://pelvicfit.xyz/lp2/
- **Dashboard:** https://pelvicfit.xyz/plan/{token}?plan={protocol}

### Key Dashboards
- [Vercel Dashboard](https://vercel.com/vaibhavcstes-projects/celestial-sagan)
- [Brevo Dashboard](https://app.brevo.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Microsoft Clarity](https://clarity.microsoft.com) — Project ID: `wgl0uzj2nj`
- [Google Sheet — Quiz Analytics](https://docs.google.com/spreadsheets/d/1HmvXtym_aBN85786-oLbuznCr5R7v6TxKtD_KE3i72I)
- [GitHub Repo](https://github.com/Vaibhavcste/pelvicfit-men)

### Folder Structure
```
PF/
├── docs/                     ← You are here
│   ├── README.md             ← This file (documentation index)
│   ├── PROJECT_STATUS.md     ← Current state, ads, performance, next steps
│   ├── MASTER_REFERENCE.md   ← Credentials, architecture, paths
│   └── BUILD_LOG.md          ← What was built and when
│
├── api/                      ← Vercel serverless functions
│   ├── submit-quiz.js        ← Lead capture → Brevo + Google Sheets
│   ├── create-protocol.js    ← Post-payment → token gen + customer activation
│   └── protocol.js           ← Token validation + progress
│
├── lp/index.html             ← Landing Page B (premium/clinical)
├── lp2/index.html            ← Landing Page C (ugly/raw direct-response)
│
├── content/                  ← Protocol content + exercise images
│   ├── firmness.json         ← 28-day Firmness protocol
│   ├── endurance.json        ← 28-day Endurance protocol
│   ├── bladder.json          ← 28-day Bladder protocol
│   ├── libido.json           ← 28-day Libido protocol
│   └── images/               ← 14 PNG exercise illustrations
│
├── plan/                     ← Dashboard SPA
│   └── index.html            ← Interactive 28-day dashboard
│
├── ads/                      ← Ad data & creatives
│   ├── data 24-04/           ← Campaign CSVs
│   ├── data 25-04/
│   ├── 26-04/
│   └── infographics/         ← ChatGPT-generated medical infographics
│
├── scripts/                  ← Build & diagnostic utilities
│   ├── check-sheet.js        ← Google Sheets read diagnostic
│   ├── map-images.js         ← Exercise → image mapper
│   └── dev-server.js         ← Local dev server
│
├── index.html                ← Main quiz funnel (25-step SPA)
├── privacy.html              ← Privacy policy
├── terms.html                ← Terms of service
├── vercel.json               ← Routing + function config
└── package.json              ← Dependencies: googleapis
```
