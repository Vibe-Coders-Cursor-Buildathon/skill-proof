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

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Auth and plans

- **Sign up / sign in:** `/auth/signup`, `/auth/login` (email + Google)
- **Dashboard:** `/dashboard` (credits balance, current plan)
- **Single user role** — capabilities come from the assigned plan
- **4 plans:** `basic`, `professional`, `premium`, `enterprise`
- **Feature flags** live in `plans.features` (JSONB) — edit in Supabase without code changes
- **TypeScript mirror:** [`src/config/plan-features.ts`](src/config/plan-features.ts)
- **Credits:** 1 credit per course generation; grants on signup from plan's `included_credits_monthly`

### Plan feature keys

| Key | Basic | Pro / Premium | Enterprise |
|-----|-------|---------------|------------|
| `can_edit_course` | no | yes | yes |
| `can_publish_course` | no | yes | yes |
| `can_add_university_stamp` | no | no | yes |
| `can_purchase_credits` | yes | yes | yes |

Adjust values in `00002_plans_and_features.sql` seed data or directly in the database.

## API routes (auth-aware)

| Route | Auth | Notes |
|-------|------|-------|
| `POST /api/courses/generate` | Required | Checks credits; spends 1 when Gemini pipeline is wired |
| `GET /api/courses?slug=` | Optional | Published courses public via RLS |
| `POST /api/courses` | Required | Save course |
| `PATCH /api/courses/[slug]` | Required | Requires `can_edit_course` |
| `POST /api/courses/[slug]/publish` | Required | Requires `can_publish_course` |
| `POST /api/credits/purchase` | Required | Stub — grants credits without payment |

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
