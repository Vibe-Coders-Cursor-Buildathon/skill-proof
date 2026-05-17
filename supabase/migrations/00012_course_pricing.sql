-- Paid public courses: publisher sets price; learners purchase for full access

alter table courses
  add column if not exists price_cents integer
    check (price_cents is null or (price_cents >= 99 and price_cents <= 99900));

comment on column courses.price_cents is
  'List price in USD cents when published for sale; null or 0 = free full access';

create table if not exists course_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  price_cents integer not null check (price_cents > 0),
  stripe_session_id text not null unique,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists course_purchases_user_id_idx on course_purchases (user_id);
create index if not exists course_purchases_course_id_idx on course_purchases (course_id);

alter table course_purchases enable row level security;

drop policy if exists "Users can view own course purchases" on course_purchases;
create policy "Users can view own course purchases"
  on course_purchases for select
  using (auth.uid() = user_id);
