# Spa.Inc — Admin & Staff Dashboard

A centralized dashboard for Spa.Inc: track clients over time, manage remote massage
therapists, monitor payments and revenue, surface top-earning staff, and manage daily
operational costs and finances.

> **Status: UI prototype.** Every screen is built and navigable, but all data comes from
> in-memory fixtures in [`src/lib/mock-data/`](src/lib/mock-data/). There is no database,
> no API layer, and no authentication yet — see [Before production launch](#before-production-launch).

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Forms | react-hook-form + Zod |
| Tables | TanStack Table |
| Planned backend | Supabase (Postgres, Auth, Storage) + Prisma |
| Deployment | Vercel |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are required while the app runs on
mock data; copy `.env.example` to `.env.local` once the Supabase backend is wired up.

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
npx tsc --noEmit  # type check
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing page |
| `/login` | Sign in (email + password, magic link) |
| `/dashboard` | Overview: summary cards, revenue vs expenses, top earners, upcoming appointments |
| `/dashboard/clients` | Client directory |
| `/dashboard/clients/[id]` | Client detail and visit history |
| `/dashboard/clients/new` | Add a client |
| `/dashboard/staff` | Staff directory |
| `/dashboard/staff/[id]` | Staff detail, schedule, and earnings |
| `/dashboard/payments` | Payment log |
| `/dashboard/payments/new` | Record a payment |
| `/dashboard/analytics` | Analytics overview |
| `/dashboard/analytics/revenue` | Revenue breakdowns by service, staff, and method |
| `/dashboard/analytics/performance` | Staff leaderboard and performance |
| `/dashboard/finances` | Expense management |
| `/dashboard/finances/pnl` | Profit & loss report |
| `/dashboard/settings` | Account, business info, user management |

## Project layout

```
src/
├── app/                  # App Router pages, layouts, error & loading boundaries
├── components/
│   ├── analytics/        # Leaderboard, performance cards
│   ├── charts/           # Recharts wrappers (revenue, P&L, distribution, …)
│   ├── clients/          # Client table columns, form, stats, visit history
│   ├── dashboard/        # Overview widgets
│   ├── finances/         # Expense table, form, breakdown
│   ├── layout/           # Sidebar, header, breadcrumbs, mobile nav
│   ├── payments/         # Payment table columns and form
│   ├── shared/           # DataTable, SummaryCard, PageHeader, EmptyState, …
│   ├── staff/            # Schedule grid, staff columns, stats
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── chart-colors.ts   # Shared chart palette
│   ├── mock-data/        # Fixture data and derived selectors
│   └── utils.ts          # cn(), formatCurrency(), formatDate(), …
└── types/                # Shared domain types
```

## Demo data

Fixtures are generated deterministically at module load (no randomness, so the
numbers are stable across reloads and between server and client):

- **~1,600 appointments** across the last 90 days and the next 14, sized so a
  7-therapist spa books roughly 17 a day.
- **One payment per completed appointment**, plus 120 standalone payments for
  gift cards, packages, tips, and retail.
- **80 expenses** across payroll, rent, supplies, utilities, equipment, and marketing.

These three generators are coupled: appointment volume drives payments, which
drive revenue, which has to stay in a believable ratio to the payroll and rent in
`expenses.ts`. The current settings land the demo spa at roughly a 33% margin.
If you change `TOTAL_APPOINTMENTS`, `STANDALONE_PAYMENTS`, or the expense amount
ranges, re-check `/dashboard/finances/pnl` — it is the page where an imbalance
shows up first.

Appointments are also distributed across staff by `staffWeights` rather than
uniformly, so the leaderboard and top-earner charts have a real spread to show.

## Design system

- **Palette:** deep blue primary `#1B4F72`, accent `#2E86C1`, light surfaces `#D6EAF8`.
  Exposed as Tailwind tokens (`spa-primary`, `spa-accent`, `spa-50`…`spa-900`) in
  [`src/app/globals.css`](src/app/globals.css).
- **Typography:** Inter via `next/font`.
- Charts share one palette through [`src/lib/chart-colors.ts`](src/lib/chart-colors.ts).

## Before production launch

The UI is complete; the platform underneath it is not. These are the open items, in order:

1. **Authentication.** `/login` validates input and then pushes to `/dashboard` without
   verifying anything. Wire up Supabase Auth (email + magic link).
2. **Role-based access.** `ADMIN` and `STAFF` exist as a type only. Add a `middleware.ts`
   that gates `/dashboard/*` and keeps staff out of expenses, P&L, and other staff's data.
3. **Database.** Add the Prisma schema and migrations for the tables in [`raw.txt`](raw.txt)
   (`users`, `clients`, `services`, `appointments`, `payments`, `expenses`, `schedules`).
4. **API routes / server actions.** Form submissions in client, payment, expense, and
   settings forms currently `console.log` their payload instead of persisting it.
5. **Replace mock data.** 36 modules import from `src/lib/mock-data`; swap these for real
   queries and keep the fixtures for a seed script and demo mode.
6. **CSV / PDF export** for payments, expenses, and the P&L report.
7. **Deploy.** Provision Supabase, set the variables from `.env.example` in Vercel, and ship.

The full product spec — schema, feature modules, API surface, and phase plan — lives in
[`raw.txt`](raw.txt).
