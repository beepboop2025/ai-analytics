# DataLens AI

**Drop in your data. Ask questions in plain English. Get AI-powered insights, charts, and executive summaries.**

![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![Claude](https://img.shields.io/badge/Claude-Sonnet_4-blueviolet.svg)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748.svg)
![Stripe](https://img.shields.io/badge/Stripe-Billing-635BFF.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

<!-- Add screenshot or demo GIF here -->
> Replace this with a screenshot showing the analysis interface with an AI-generated chart and insights panel

---

## The Problem

Business teams export CSVs from their tools, open them in spreadsheets, and spend hours building charts and writing summaries. Data analysts are backlogged. Dashboards are rigid.

**DataLens AI turns any CSV or Excel file into actionable insights** — upload your data, ask a question in plain English, and get AI-generated charts, statistical analysis, and board-ready narratives. Powered by Claude Sonnet 4.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Configuration](#configuration)
- [Pricing](#pricing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

| | Feature | Description |
|---|---------|-------------|
| :brain: | **Natural Language Queries** | Ask questions about your data in plain English — Claude generates insights |
| :bar_chart: | **Auto-Generated Charts** | Bar, line, area, pie, scatter charts created from your data automatically |
| :page_facing_up: | **Executive Summaries** | AI-written narratives with importance-ranked insights |
| :open_file_folder: | **Multi-Format Upload** | CSV, Excel (XLSX/XLS), JSON with automatic schema detection |
| :chart_with_upwards_trend: | **Time-Series Forecasting** | ARIMA forecasting via Python data engine |
| :credit_card: | **Stripe Billing** | Self-serve subscriptions with usage tracking |
| :lock: | **Auth** | Email/password + Google OAuth via NextAuth.js |
| :mag: | **Statistical Profiling** | Distributions, correlations, outliers via DuckDB + Polars |
| :clipboard: | **Report History** | Save and revisit past analyses |

---

## Quick Start

```bash
git clone https://github.com/beepboop2025/ai-analytics.git
cd ai-analytics
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys (see Configuration)

# Initialize database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

Opens at `http://localhost:3000`.

### Python Data Engine (Optional)

```bash
cd engine
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8080
```

Adds DuckDB SQL queries, statistical profiling, and ARIMA forecasting.

---

## Architecture

```mermaid
graph TB
    subgraph Frontend
        A[Next.js 16 App Router] --> B[Dashboard]
        A --> C[Dataset Manager]
        A --> D[AI Analysis Chat]
        A --> E[Reports]
    end

    subgraph API Layer
        F[NextAuth.js] --> G[Auth + Sessions]
        H[Stripe Webhooks] --> I[Billing]
        J[/api/ai/analyze] --> K[Claude Sonnet 4]
        L[/api/datasets] --> M[Vercel Blob Storage]
    end

    subgraph Data Engine
        N[Python FastAPI] --> O[DuckDB]
        N --> P[Polars + Pandas]
        N --> Q[ARIMA Forecast]
    end

    subgraph Storage
        R[(PostgreSQL)] --> A
        M --> A
    end

    A --> F
    A --> J
    A --> L
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Recharts |
| AI | Anthropic Claude Sonnet 4 |
| Auth | NextAuth.js 5 (Google OAuth + credentials) |
| Database | Prisma 7 + PostgreSQL |
| File Storage | Vercel Blob |
| Billing | Stripe (subscriptions + webhooks) |
| Data Engine | Python FastAPI, DuckDB, Polars, statsmodels |
| Email | Resend (verification, password reset) |
| Analytics | PostHog, Google Tag Manager |
| Deploy | Vercel, Netlify, or Docker |

---

## Configuration

Required environment variables (`.env`):

| Variable | Service | Required |
|----------|---------|:--------:|
| `DATABASE_URL` | PostgreSQL (Neon or local) | Yes |
| `NEXTAUTH_SECRET` | Session encryption | Yes |
| `ANTHROPIC_API_KEY` | Claude AI analysis | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob file storage | Yes |
| `STRIPE_SECRET_KEY` | Billing | For billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks | For billing |
| `RESEND_API_KEY` | Email (verification, reset) | For email |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics | No |

---

## Pricing

| Plan | Price | Queries/mo | Datasets | File Size |
|------|-------|:----------:|:--------:|:---------:|
| **Free** | $0 | 10 | 3 | 5 MB |
| **Pro** | $29/mo | 500 | 50 | 50 MB |
| **Enterprise** | $99/mo | Unlimited | Unlimited | 500 MB |

Usage counters reset monthly. Stripe checkout handles subscriptions.

---

## Roadmap

- [ ] Team workspaces with shared datasets and reports
- [ ] API key generation for programmatic access
- [ ] Custom chart templates and saved visualizations
- [ ] Scheduled reports (daily/weekly email digests)
- [ ] Data connectors (Google Sheets, Airtable, databases)

---

## License

MIT
