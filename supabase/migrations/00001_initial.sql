create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  source_type text not null check (source_type in ('youtube', 'pdf', 'article')),
  source_ref text,
  language text not null default 'en',
  difficulty text not null default 'beginner',
  content jsonb not null,
  created_at timestamptz default now()
);

create index courses_slug_idx on courses (slug);

-- RLS policies to be added when P3 implements course routes.
-- Suggested: public SELECT by slug; INSERT via service role only.
