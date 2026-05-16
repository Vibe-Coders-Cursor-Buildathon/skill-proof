# SkillProof

> Paste any YouTube link, PDF, or article. Get a full course with quizzes and a verified certificate — in 60 seconds, in any language.

SkillProof transforms content into structured micro-courses powered by Google Gemini 2.0 Flash, with Supabase for persistence and Next.js 16 for the full-stack app.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, Tailwind CSS v4, shadcn/ui |
| AI | Google Gemini 2.0 Flash + Files API |
| Database | Supabase (PostgreSQL) |
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

### Database

Apply the initial migration from [`supabase/migrations/00001_initial.sql`](supabase/migrations/00001_initial.sql) in your Supabase SQL editor or via the Supabase CLI.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project structure

```
src/
├── app/                    # Routes and API handlers
│   ├── page.tsx            # Landing / upload (P1)
│   ├── course/[slug]/      # Course viewer (P1)
│   └── api/                # API routes (stubs → Phase 1)
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── layout/             # Header, footer, page shell
│   ├── upload/             # Source picker (P1)
│   ├── course/             # Summary view (P1)
│   ├── flashcards/         # Card flipper (P1)
│   ├── quiz/               # Quiz UI (P1)
│   ├── coach/              # Study coach chat (P1)
│   └── certificate/        # PNG certificate (P1)
├── lib/
│   ├── gemini/             # Gemini client + Files API (P2)
│   ├── prompts/            # Prompt templates (P2)
│   ├── content/            # YouTube + article fetch (P3)
│   └── supabase/           # DB clients (P3)
├── types/                  # Zod schemas + shared types
└── config/                 # Env validation, constants
```

## Team ownership

| Person | Areas |
|--------|-------|
| P1 Frontend | `src/components/*`, `src/app/page.tsx`, `src/app/course/[slug]` |
| P2 Gemini | `src/lib/gemini/*`, `src/lib/prompts/*`, generate/adaptive/coach APIs |
| P3 Backend | `src/lib/content/*`, `src/lib/supabase/*`, `supabase/`, course CRUD APIs |
| P4 DevOps | Vercel deploy, `.env.example`, demo seed data |

## Phase 0 status

This branch establishes folder structure and stubs only. API routes return `501 Not implemented`. No Gemini or Supabase business logic is wired yet.

## Environment variables

See [`.env.example`](.env.example) for required keys.
