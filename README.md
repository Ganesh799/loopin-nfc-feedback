# Loopin — NFC/QR Customer Feedback SaaS (MVP)

A multi-tenant SaaS where a business gets an NFC card + QR code; customers tap or scan
it, leave a 1–5 star rating with optional comment/categories, and are then offered
**both** a Google review link and a private-feedback channel — never one gated behind
the other.

This is a working MVP scaffold: it builds, typechecks, and lints cleanly against
placeholder environment variables. To actually run it end-to-end you need a real
Supabase project (free tier is enough) — see setup below.

## Stack

- **Next.js 14 (App Router) + TypeScript + Tailwind**, deployed to **Vercel**
- **Supabase** (Postgres + Auth + Storage) — Row Level Security enforces multi-tenant
  isolation at the database level; see the long comment at the top of
  `supabase/migrations/0001_init.sql` for the reasoning
- **`qrcode`** for on-demand server-side QR generation (no external API/cost)
- **Recharts** for the dashboard charts
- **Zod** for input validation on every write path
- Optional **Upstash Redis** for distributed rate limiting on the public endpoints
  (falls back to an in-memory limiter if unset — fine for local dev, not for a
  multi-instance production deploy)

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project. **Pick a region close to
   your customers** (e.g. Frankfurt/EU if you're serving European businesses — keeps
   customer data in-region for GDPR purposes).
2. In **Project Settings → API**, copy the Project URL, `anon` public key, and
   `service_role` key (keep the service role key secret — never commit it, never put
   it in a `NEXT_PUBLIC_*` variable).
3. In **Authentication → Providers**, email/password is enabled by default — that's
   all this MVP uses. (Email confirmation is on by default too; you can turn it off
   in Authentication → Settings for faster local testing.)
4. Run the migrations. Easiest path: open **SQL Editor** in the Supabase dashboard and
   run `supabase/migrations/0001_init.sql`, then `supabase/migrations/0002_storage.sql`,
   in that order. (If you use the Supabase CLI instead: `supabase db push`.)

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the four Supabase values from step 1, plus `NEXT_PUBLIC_APP_URL` (use
`http://localhost:3000` for local dev). Leave the Upstash variables blank for now.

## 3. Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Sign up → you'll be asked to confirm your email (check
Supabase's built-in email testing in **Authentication → Users**, or turn off email
confirmation for local dev as noted above) → you'll land in onboarding → create your
first business → you're in the dashboard.

Go to **Cards**, create a card (e.g. "Front Desk"), and open its QR code / copy its
link — that link is your public feedback page. Open it in an incognito tab to try the
customer flow end to end.

## 4. Writing an actual NFC card

There's no NFC-specific backend work needed — an NFC card just launches a URL. Buy
blank NTAG213/215 NFC cards or stickers, install a free NFC-writer app (e.g. "NFC
Tools" on iOS/Android), and write each card's feedback URL (from the Cards page) to
its chip. The printed QR code (auto-generated per card) is the fallback for phones
without NFC.

## 5. Making yourself a platform admin

The `/admin` dashboard (all businesses, platform-wide stats) is gated behind
`profiles.is_platform_admin`. Nothing in the UI can set this — promote yourself
directly in the Supabase SQL Editor after signing up:

```sql
update public.profiles set is_platform_admin = true where id = '<your-auth-user-uuid>';
```

(Find your uuid in **Authentication → Users**.)

## 6. Deploying

Push this to a GitHub repo, import it into **Vercel**, and set the same environment
variables from `.env.local` in the Vercel project settings (Production + Preview).
Vercel builds Next.js out of the box — no extra config needed.

Before going live, also:

- **Run `npm audit`** and update dependencies — this scaffold pins reasonably recent
  versions, but Next.js in particular ships security patches frequently; check for a
  newer 14.2.x (or consider the 15.x upgrade) before launch.
- **Set up Upstash Redis** (`UPSTASH_REDIS_REST_URL` / `_TOKEN`, free tier is plenty
  to start) so rate limiting on `/api/feedback` actually works across Vercel's
  multiple server instances — the in-memory fallback only limits per-instance.
- **Restrict the image `remotePatterns`** in `next.config.mjs` if you add more image
  sources later; it currently only trusts your own Supabase Storage domain.

## What's intentionally stubbed for later

This is an MVP — these are straightforward, scoped follow-ups, not missing
fundamentals:

- **Billing** — no Stripe integration yet; the pricing page is a static placeholder.
- **Email notifications** — "Send feedback directly to the business" records the
  event and shows it in the dashboard immediately, but doesn't yet email the owner.
  Add Resend/Postmark in a route handler off the `/api/feedback-outcome` endpoint.
- **Multiple businesses per user** — `requireCurrentBusiness()` assumes one business
  per account (fine for a single-location owner). An agency managing several clients
  would need a business switcher; the schema already supports it (`business_users`
  is many-to-many), only the UI needs it.
- **CSV export / date-range filtering** on the feedback list.
- **Team invites** — adding a staff member currently requires a direct database
  insert into `business_users`; a proper invite-by-email flow is a natural Stage 11.

## Project structure

```
src/
  app/
    page.tsx                 Landing page
    login/, signup/           Auth
    onboarding/                First-business creation
    dashboard/                 Business owner dashboard (protected)
      page.tsx                 Overview + analytics
      feedback/                 Full feedback list
      cards/                    NFC/QR card management
      settings/                 Business profile, branding, categories
    admin/                      Platform admin (protected, is_platform_admin only)
    f/[slug]/[cardId]/          Public, anonymous customer feedback page
    api/feedback/                Feedback submission (service-role write)
    api/feedback-outcome/        Marks Google-click / private-feedback outcome
    api/cards/[cardId]/qr/       On-demand QR PNG generation
  lib/
    supabase/                   client.ts (browser), server.ts (RLS-scoped),
                                 admin.ts (service-role, public endpoints only)
    analytics.ts                 Dashboard aggregate queries
    current-business.ts          Auth + business-membership guard for dashboard pages
    rate-limit.ts                 Upstash-or-memory rate limiter
supabase/migrations/            SQL schema + RLS policies (source of truth for the DB)
```
