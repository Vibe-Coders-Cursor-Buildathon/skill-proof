-- 00011: publish approval
alter table courses
  add column if not exists publish_status text not null default 'draft'
    check (publish_status in ('draft', 'pending', 'approved', 'rejected')),
  add column if not exists publish_requested_at timestamptz,
  add column if not exists publish_reviewed_at timestamptz,
  add column if not exists publish_rejection_reason text;

update courses
set publish_status = 'approved'
where is_published = true
  and (publish_status is null or publish_status = 'draft');

create index if not exists courses_publish_status_pending_idx
  on courses (publish_status)
  where publish_status = 'pending';

-- 00012: course pricing
alter table courses
  add column if not exists price_cents integer
    check (price_cents is null or (price_cents >= 99 and price_cents <= 99900));

create table if not exists course_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  course_id uuid not null references courses (id) on delete cascade,
  price_cents integer not null check (price_cents > 0),
  stripe_session_id text not null unique,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

alter table course_purchases enable row level security;

drop policy if exists "Users can view own course purchases" on course_purchases;
create policy "Users can view own course purchases"
  on course_purchases for select
  using (auth.uid() = user_id);