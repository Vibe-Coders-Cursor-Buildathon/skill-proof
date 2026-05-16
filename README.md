# SkillProof

> Paste any YouTube link, PDF, or article. Get a full course with quizzes and a verified certificate — in 60 seconds, in any language.

SkillProof transforms content into structured micro-courses powered by Google Gemini 2.0 Flash, with Supabase for persistence and Next.js 16 for the full-stack app.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, Tailwind CSS v4, shadcn/ui |
| AI | Google Gemini 2.0 Flash + Files API |
| Database | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel |

## Getting started

### Prerequisites

- Node.js 20.9+
- npm
- Supabase project
- Gemini API key

### Setup

```bash
npm install
cp .env.example .env.local
# Fill in GEMINI_API_KEY and Supabase credentials in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase connection

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Copy from **Project Settings → API** into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; used for credit grants via admin client)
3. **Authentication → Providers:** enable Email and Google
4. Add redirect URL: `http://localhost:3000/auth/callback` (and your production URL)
5. Run all migrations in order (see below)

### Database migrations

Apply migrations in order in the Supabase SQL Editor (or `supabase db push`):

| File | Purpose |
|------|---------|
| `00001_initial.sql` | `courses` table |
| `00002_plans_and_features.sql` | 4 plans with JSONB feature flags |
| `00003_profiles.sql` | User profiles linked to `auth.users` |
| `00004_credit_transactions.sql` | Credit ledger + spend/grant functions + signup trigger |
| `00005_credit_packs.sql` | Purchasable credit bundles |
| `00006_courses_ownership.sql` | Course ownership, publish, edit columns |
| `00007_rls_policies.sql` | Row Level Security policies |
| `00008_profile_roles.sql` | Profile roles (`customer` / `admin`) + admin RLS |

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed:admin` | Create dev admin user (`admin@gmail.com` / `admin`) |

## Auth and plans

- **Sign up / sign in:** `/auth/signup`, `/auth/login` (email + Google)
- **Dashboard:** `/dashboard` (credits balance, current plan)
- **Profile roles:** `customer` (default) or `admin` on `profiles.role`. Plan features still control product capabilities; admins get the **Admin panel** at `/admin`.
- **Dev admin account:** After migrations, run `npm run seed:admin`, then sign in with `admin@gmail.com` / `admin`. Change this password in production.
- **4 plans:** `free`, `individual`, `business`, `enterprise` (see migration `00010_align_plans_with_pricing.sql`)
- **Feature flags** live in `plans.features` (JSONB) — edit in Supabase without code changes
- **TypeScript mirror:** [`src/config/plan-features.ts`](src/config/plan-features.ts)
- **Credits:** 1 credit per course generation; grants on signup (3 free) and on first paid subscription checkout

### Plan tiers (monthly credits)

| Plan | Slug | Credits/mo | Publish limit |
|------|------|------------|---------------|
| Free | `free` | 3 | 0 |
| Individual | `individual` | 20 | 0 |
| Business | `business` | 40 | 4 |
| Enterprise | `enterprise` | 100 | 10 |

### Plan feature keys

| Key | Free | Individual | Business | Enterprise |
|-----|------|------------|----------|------------|
| `can_edit_course` | no | yes | yes | yes |
| `can_issue_certificate` | no | yes | yes | yes |
| `can_publish_course` | no | no | yes | yes |
| `can_add_university_stamp` | no | no | yes | yes |
| `max_published_courses` | 0 | 0 | 4 | 10 |

## Content → course pipeline

| Step | Route / file | Technology |
|------|----------------|------------|
| 1. Extract transcript | `POST /api/content/youtube` | YouTube caption tracks (no Gemini — fast & free) |
| 2. Generate course JSON | `POST /api/courses/generate` | **Gemini 2.0 Flash** via `src/lib/gemini/generate-course.ts` |
| 3. Save & display | `POST /api/courses` | Supabase |

### Where to put your Gemini API key

1. Copy `.env.example` → `.env.local`
2. Set `GEMINI_API_KEY=your_key_here` (from [Google AI Studio](https://aistudio.google.com/apikey))
3. The key is read server-side only in `src/config/env.ts` → `getServerEnv()`
4. Never expose it in client components (`"use client"` files)

### Wiring course generation (next step for your backend friend)

In `src/app/api/courses/generate/route.ts`, after credit checks:

```ts
// 1. Get transcript (YouTube example)
const transcriptRes = await fetch(`${origin}/api/content/youtube`, {
  method: "POST",
  body: JSON.stringify({ url: body.sourceUrl, language: body.language }),
});
const { transcript } = await transcriptRes.json();

// 2. Call Gemini
import { generateCourseFromContent } from "@/lib/gemini/generate-course";
const course = await generateCourseFromContent({
  content: transcript,
  language: body.language,
  difficulty: body.difficulty,
  sourceType: "youtube",
});

// 3. spendCourseCredit(user.id) then save to Supabase
```

Frontend flow: homepage upload → auth modal (if needed) → **progress modal** (`CourseGenerationModal`) calls `/api/content/youtube` → redirects to `/dashboard`.

## API routes (auth-aware)

| Route | Auth | Notes |
|-------|------|-------|
| `POST /api/content/youtube` | Public (for now) | Extracts transcript from YouTube URL |
| `POST /api/courses/generate` | Required | Checks credits; spends 1 when Gemini pipeline is wired |
| `GET /api/courses?slug=` | Optional | Published courses public via RLS |
| `POST /api/courses` | Required | Save course |
| `PATCH /api/courses/[slug]` | Required | Requires `can_edit_course` |
| `POST /api/courses/[slug]/publish` | Required | Requires `can_publish_course` |
| `POST /api/credits/purchase` | Required | Stub — grants credits without payment |
| `POST /api/stripe/create-checkout-session` | Required | Starts Stripe Checkout (test mode) |
| `POST /api/stripe/webhook` | Stripe signature | Fulfills plan + credits after payment |

## Stripe payments (sandbox / test mode)

SkillProof uses **Stripe Checkout** for:

- **Subscriptions** (Individual / Business / Enterprise) — Price IDs from your Stripe Product Catalog
- **Credit top-up** (one-time) — dynamic `price_data` in code (unchanged; do not replace with catalog prices)

Flow: `/pricing` → `/checkout` → pay → webhook or success page updates Supabase profile + credits.

### 1. Create a Stripe account

1. Sign up at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Stay in **Test mode** (toggle in the dashboard header)

### 2. API keys → `.env.local`

From **Developers → API keys** (test mode):

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
```

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is optional for hosted Checkout (redirect flow).

### 3. Subscription Product Catalog (required for paid plans)

In **Test mode**, create three products with **monthly recurring** prices:

| Product | Price |
|---------|-------|
| SkillProof Individual | $10.00 USD / month |
| SkillProof Business | $20.00 USD / month |
| SkillProof Enterprise | $35.00 USD / month |

Optional Price metadata: `pricing_plan_id` = `individual` | `business` | `enterprise`.

Add to `.env.local`:

```env
STRIPE_PRICE_INDIVIDUAL=price_xxxxxxxx
STRIPE_PRICE_BUSINESS=price_xxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxx
```

Free plan is not sold in Stripe — new users get `free` via signup trigger.

### 4. Webhook secret (optional locally, recommended)

**Quick local test (no webhook):** If you only set `STRIPE_SECRET_KEY` and the three `STRIPE_PRICE_*` vars, subscription and **credit top-up** Checkout still work. After payment, the **success page** confirms the session with Stripe and updates your plan/credits. You do **not** need `STRIPE_WEBHOOK_SECRET` for that.

**Same webhook** handles both `checkout_type: "credits"` and plan subscriptions (`checkout.session.completed`). Adding `STRIPE_WEBHOOK_SECRET` does not break top-up — it makes fulfillment reliable if the user closes the tab before the success page.

**Recommended for production** — install [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhook testing too:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_…` value into `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
```

Restart `npm run dev` after changing env vars.

**Production** — in Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- URL: `https://your-domain.com/api/stripe/webhook`
- Events: `checkout.session.completed`
- Copy the signing secret into your host’s env as `STRIPE_WEBHOOK_SECRET`

### 5. Test a payment

1. Apply migration `00010_align_plans_with_pricing.sql` in Supabase
2. `npm run dev` + optional `stripe listen …` (separate terminal)
3. Sign in → `/pricing` → choose a paid plan → **Pay**
4. On Stripe Checkout use test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP
5. After success you should land on `/checkout/success` and see updated credits on `/dashboard`
6. Regression: credit top-up from dashboard still grants credits (`reason: credit_purchase`)

| Pricing UI plan | DB plan slug | Stripe env var |
|-----------------|--------------|----------------|
| Free | `free` | (no Stripe) |
| Individual | `individual` | `STRIPE_PRICE_INDIVIDUAL` |
| Business | `business` | `STRIPE_PRICE_BUSINESS` |
| Enterprise | `enterprise` | `STRIPE_PRICE_ENTERPRISE` |

More test cards: [Stripe testing docs](https://docs.stripe.com/testing)

## Project structure

```
src/
├── app/
│   ├── auth/               # Login, signup, OAuth callback
│   ├── dashboard/          # User profile + credits
│   └── api/                # Route handlers
├── components/auth/        # Login/signup forms
├── lib/
│   ├── auth/               # Session, credits, plan guards
│   └── supabase/           # Browser + server clients, middleware
├── config/plan-features.ts # Feature flag keys (keep in sync with DB)
└── types/plan.ts           # Zod schemas for plans/profiles
supabase/migrations/        # Ordered SQL migrations
```

## Environment variables

See [`.env.example`](.env.example) for required keys.
